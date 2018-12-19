const PromiseThrottle = require('promise-throttle');
const parseBody = require('co-body');
const shared = require('./shared');
const axios = require('axios');
const querystring = require('querystring');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('Invalid HTTP method');
    res.statusCode = 204;
    return res.end();
  }

  if (!req.headers['webhook-id'] || req.headers['webhook-id'] !== process.env.WEBHOOK_ID) {
    console.error('Unauthorized');
    res.statusCode = 204;
    return res.end();
  }

  try {
    const body = await parseBody.json(req);
    if (body.event !== 'device/online') {
      console.error('Unsupported event: %s', body.event);
      res.statusCode = 204;
      return res.end();
    }

    const goals = await getGoalValues(body.coreid);
    if (!goals) {
      console.error('Invalid device: %s', body.coreid);
      res.statusCode = 204;
      return res.end();
    }

    console.log('%s: sending goal updates %o', body.coreid, goals);
    const accessToken = await shared.auth.getAccessToken();
    const throttle = new PromiseThrottle({ requestsPerSecond: 2, promiseImplementation: Promise });
    await Promise.all(
      goals.map((b, i) => throttle.add(
        () => axios.post(
          'https://api.particle.io/v1/devices/events',
          querystring.stringify({
            name: `${body.coreid}/update`,
            data: `${(i + 1)}|${b.value}|${b.promise}`,
            private: true,
            ttl: 86400, // 24hrs
            access_token: accessToken
          }))
      )));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }

  res.statusCode = 200;
  return res.end('OK');
};

async function getGoalValues(deviceId) {
  const response = await shared.dynamo.db.getItem({
    TableName: 'devices',
    Key: { deviceId: { S: deviceId } }
  }).promise();

  if (!response.Item) {
    return null;
  }

  const device = shared.dynamo.marshaller.unmarshallItem(response.Item);
  return device.goals.map(d => {
    return {
      value: (d.current / d.total).toFixed(2),
      promise: (d.promise / d.total).toFixed(2)
    };
  });
}
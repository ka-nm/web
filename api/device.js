const { parse } = require('url');
const querystring = require('querystring');
const parseBody = require('co-body');
const PromiseThrottle = require('promise-throttle');
const Joi = require('joi');
const axios = require('axios');
const shared = require('./shared');

const schema = Joi.object().keys({
  deviceId: Joi.string().alphanum().required(),
  buckets: Joi.array().length(4).required().items(Joi.object().keys({
    name: Joi.string(),
    enabled: Joi.boolean(),
    percentage: Joi.number().min(0).max(1).required(),
    color: Joi.number().integer().min(0).max(16777215)
  })),
  data: Joi.array().length(4).required().items(Joi.object().keys({
    total: Joi.number().greater(0).required(),
    current: Joi.number().min(0).max(Joi.ref('total')),
    promise: Joi.number().min(0).max(Joi.ref('total'))
  }))
});

module.exports = async (req, res) => {
  try {
    const { query } = parse(req.url, true);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      res.end();
    } else if (req.method === 'GET' || req.method === 'PUT') {
      const device = await getDevice(query.deviceId);
      if (!device) {
        res.statusCode = 404;
        return res.end('Not Found');
      }

      // GET
      if (req.method === 'GET') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        return res.end(JSON.stringify(device));
      }

      // PUT
      const body = await parseBody.json(req);
      const result = Joi.validate(body, schema);
      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result.error.details.map(d => d.message)));
      }

      await shared.dynamo.db.putItem({
        TableName: 'devices',
        Item: shared.dynamo.marshaller.marshallItem(body)
      }).promise();

      const accessToken = await shared.auth.getAccessToken();
      const throttle = new PromiseThrottle({ requestsPerSecond: 2, promiseImplementation: Promise });
      await Promise.all(
        body.data.map((d, i) => throttle.add(
          () => axios.post(
            'https://api.particle.io/v1/devices/events',
            querystring.stringify({
              name: `${body.deviceId}/update`,
              data: `${(i + 1)}|${(d.current / d.total).toFixed(2)}|${(d.promise / d.total).toFixed(2)}`,
              private: true,
              ttl: 86400, // 24hrs
              access_token: accessToken
            }))
        )));

      res.statusCode = 204;
      return res.end();
    }

    console.error('Invalid HTTP method');
    res.statusCode = 405;
    return res.end();
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }
};

async function getDevice(deviceId) {
  const data = await shared.dynamo.db.getItem({
    TableName: 'devices',
    Key: { deviceId: { S: deviceId } }
  }).promise();

  return data.Item ? shared.dynamo.marshaller.unmarshallItem(data.Item) : null;
}
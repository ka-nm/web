const parseBody = require('co-body');
const shared = require('./shared');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('Invalid HTTP method');
    res.setHeader('Content-Length', '0');
    res.statusCode = 405;
    return res.end();
  }

  if (!req.headers['webhook-id'] || req.headers['webhook-id'] !== process.env.WEBHOOK_ID) {
    console.error('Unauthorized');
    res.setHeader('Content-Length', '0');
    res.statusCode = 401;
    return res.end('Unauthorized');
  }

  try {
    const body = await parseBody.json(req);
    if (body.event !== 'device/online') {
      console.error('Unsupported event: %s', body.event);
      res.statusCode = 204;
      return res.end();
    }

    const device = await shared.device.getById(body.coreid);
    if (!device) {
      console.error('Invalid device: %s', body.coreid);
      res.setHeader('Content-Length', '0');
      res.statusCode = 204;
      return res.end();
    }

    const accessToken = await shared.particle.getAccessToken();
    await shared.particle.updateDevice(accessToken, device);
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }

  res.statusCode = 200;
  return res.end('OK');
};
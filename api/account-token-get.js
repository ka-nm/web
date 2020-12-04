const { parse } = require('url');
const axios = require('axios');
const CSRF = require('csrf');
const shared = require('./shared');

const csrf = new CSRF();

module.exports = async (req, res) => {
  try {
    shared.cors.setStandardHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      return res.end();
    } else if (req.method === 'GET') {
      const { query } = parse(req.url, true);
      const device = await shared.device.getByCode(query.deviceCode);
      if (!device) {
        res.statusCode = 404;
        return res.end('Not Found');
      }
      console.log("account-token-get process.env", process.env)
      const particleToken = await shared.particle.getAccessToken();
      const deviceResponse = await axios.get(`${process.env.PARTICLE_PRODUCT_BASE_URL}/devices`, {
        headers: { Authorization: `Bearer ${particleToken}` },
        params: { deviceId: device.deviceId }
      });

      if (!deviceResponse.data.devices.length) {
        console.log('Device %s does not exist within product', device.deviceId);
        res.statusCode = 404;
        return res.end('Not Found');
      }

      if (deviceResponse.data.customers.length) {
        res.statusCode = 409;
        return res.end('Device Claimed');
      }

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(JSON.stringify({ token: csrf.create(device.deviceId) }));
    } else {
      res.statusCode = 405;
      return res.end();
    }
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }
};
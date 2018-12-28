const { parse } = require('url');
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

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(JSON.stringify({ token: csrf.create(device.deviceId) }));
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
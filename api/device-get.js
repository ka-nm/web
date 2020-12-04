const { parse } = require('url');
const shared = require('./shared');

module.exports = async (req, res) => {
  try {
    shared.cors.setStandardHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      return res.end();
    } else if (req.method === 'GET') {
      const jwtPayload = await shared.auth0.validateJwt(req);
      if (!jwtPayload) {
        res.statusCode = 401;
        return res.end('Unauthorized');
      }

      const { query } = parse(req.url, true);
      const device = await shared.device.getById(query.deviceId);
      if (!device) {
        res.statusCode = 404;
        return res.end('Not Found');
      }
      console.log("device-get process.env", process.env)

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(JSON.stringify(device));
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
const { parse } = require('url');
const parseBody = require('co-body');
const axios = require('axios');
const CSRF = require('csrf');
const querystring = require('querystring');
const Joi = require('joi');
const shared = require('./shared');

const csrf = new CSRF();
const schema = Joi.object().keys({
  deviceCode: Joi.string().regex(/([A-Z]|[0-9]){6}/),
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8),
});

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
    } else if (req.method === 'POST') {
      const requestBody = await parseBody.json(req);
      const result = Joi.validate(requestBody, schema);
      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result.error.details.map(d => d.message)));
      }

      const device = await shared.device.getByCode(requestBody.deviceCode);
      if (!device) {
        res.statusCode = 404;
        return res.end('Not Found');
      }

      if (!csrf.verify(device.deviceId, requestBody.token)) {
        res.statusCode = 403;
        return res.end('Forbidden');
      }

      const auth0Token = await shared.auth0.getAccessToken();
      await axios({
        method: 'post',
        url: 'https://digipiggy.auth0.com/api/v2/users',
        headers: { Authorization: `Bearer ${auth0Token}` },
        data: {
          connection: 'Username-Password-Authentication',
          email: requestBody.email,
          password: requestBody.password
        }
      });

      const custResponse = await axios({
        method: 'post',
        url: 'https://api.particle.io/v1/products/8466/customers',
        auth: {
          username: process.env.DIGIPIGGY_CLIENT_ID,
          password: process.env.DIGIPIGGY_CLIENT_SECRET,
        },
        data: querystring.stringify({
          email: requestBody.email,
          no_password: true
        })
      });

      await shared.token.store(requestBody.email, custResponse.data.access_token, custResponse.data.refresh_token);

      const claimResponse = await axios.post(
        `https://api.particle.io/v1/products/8466/device_claims?access_token=${custResponse.data.access_token}`
      );

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        accessToken: custResponse.data.access_token,
        claimCode: claimResponse.data.claim_code
      }));
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
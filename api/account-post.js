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
    } else if (req.method === 'POST') {
      const requestBody = await parseBody.json(req);
      const result = Joi.validate(requestBody, schema);
      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result.error.details.map(d => d.message)));
      }

      // validate device code and token
      const device = await shared.device.getByCode(requestBody.deviceCode);
      if (!device) {
        res.statusCode = 404;
        return res.end('Not Found');
      }

      if (!csrf.verify(device.deviceId, requestBody.token)) {
        res.statusCode = 403;
        return res.end('Forbidden');
      }

      // validate Auth0 account
      const auth0Token = await shared.auth0.getAccessToken();
      const userResponse = await axios.get(`${process.env.AUTH0_BASE_URL}/api/v2/users-by-email`, {
        headers: { Authorization: `Bearer ${auth0Token}` },
        params: {
          email: requestBody.email,
          fields: 'user_id'
        }
      });

      if (userResponse.data.length) {
        console.log('Auth0 account already exists for %s', requestBody.email);
        res.statusCode = 409;
        return res.end('Account Exists');
      }

      //create Auth0 account if user doesn't exist
      await axios({
        method: 'post',
        url: `${process.env.AUTH0_BASE_URL}/api/v2/users`,
        headers: {Authorization: `Bearer ${auth0Token}`},
        data: {
          connection: 'Username-Password-Authentication',
          email: requestBody.email,
          password: requestBody.password
        }
      });

      //try to create customer in particle
      let custAccessToken = null;
      const custResponse = await axios({
        method: 'post',
        url: `${process.env.PARTICLE_PRODUCT_BASE_URL}/customers`,
        auth: {
          username: process.env.DIGIPIGGY_CLIENT_ID,
          password: process.env.DIGIPIGGY_CLIENT_SECRET,
        },
        data: querystring.stringify({
          email: requestBody.email,
          no_password: true
        }),
        validateStatus: (status) => (status >= 200 && status < 300) || status === 400
      });

      if (custResponse === 200) {
        custAccessToken = custResponse.data.access_token
        //if customer exists, then get auth token via different api
      } else if (custResponse.status === 400 && custResponse.data && custResponse.data.error === 'customer_exists') {
        console.log('getting access token');
        const custTokenResponse = await axios({
          method: 'post',
          url: 'https://api.particle.io/oauth/token',
          auth: {
            username: process.env.DIGIPIGGY_CLIENT_ID,
            password: process.env.DIGIPIGGY_CLIENT_SECRET,
          },
          data: querystring.stringify({
            scope: `customer=${requestBody.email}`,
            grant_type: 'client_credentials'
          }),
        });

        custAccessToken = custTokenResponse.data.access_token;

      } else {
        console.log('Particle error', custResponse);
        res.statusCode = 500;
        return res.end('Failure');
      }

      if (!custAccessToken) {
        console.log('No customer access token');
        res.statusCode = 500;
        return res.end('Failure');
      }

      await shared.particle.storeUserAccessToken(requestBody.email, custAccessToken);

      const claimResponse = await axios.post(`${process.env.PARTICLE_PRODUCT_BASE_URL}/device_claims`, null, {
        headers: { Authorization: `Bearer ${custAccessToken}` }
      });

      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ claimCode: claimResponse.data.claim_code }));
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

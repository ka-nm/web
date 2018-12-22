const parseBody = require('co-body');
const axios = require('axios');
const querystring = require('querystring');
const Joi = require('joi');

const schema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().min(8)
});

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      res.end();
    } else if (req.method === 'POST') {
      // TODO: need CSRF protection

      const requestBody = await parseBody.json(req);
      const result = Joi.validate(requestBody, schema);
      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result.error.details.map(d => d.message)));
      }

      const custResponse = await axios({
        method: 'post',
        url: 'https://api.particle.io/v1/products/8466/customers',
        auth: {
          username: process.env.DIGIPIGGY_CLIENT_ID,
          password: process.env.DIGIPIGGY_CLIENT_SECRET,
        },
        data: querystring.stringify({
          email: requestBody.email,
          password: requestBody.password
        }),
        maxRedirects: 0,
        validateStatus: status => status >= 200 && status < 400
      });

      console.log(`TOKEN: ${custResponse.data.access_token}`);
      const claimResponse = await axios.post(
        `https://api.particle.io/v1/products/8466/device_claims?access_token=${custResponse.data.access_token}`
      );

      console.log(`CLAIM CODE: ${claimResponse.data.claim_code}`);
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({ claimCode: claimResponse.data.claim_code }));
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
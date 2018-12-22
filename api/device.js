const { parse } = require('url');
const parseBody = require('co-body');
const Joi = require('joi');
const shared = require('./shared');

const schema = Joi.object().keys({
  deviceId: Joi.string().alphanum().required(),
  goals: Joi.array().length(4).required().items(Joi.object().keys({
    name: Joi.string(),
    enabled: Joi.boolean(),
    percentage: Joi.number().min(0).max(1).required(),
    color: Joi.number().integer().min(0).max(16777215),
    total: Joi.number().greater(0).required(),
    current: Joi.number().min(0).max(Joi.ref('total')),
    promise: Joi.number().min(0).max(Joi.ref('total'))
  }))
});

module.exports = async (req, res) => {
  try {
    const { query } = parse(req.url, true);

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      res.end();
    } else if (req.method === 'GET' || req.method === 'PUT') {
      const device = await shared.device.get(query.deviceId);
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
      const requestBody = await parseBody.json(req);
      const result = Joi.validate(requestBody, schema);
      if (result.error) {
        res.statusCode = 400;
        return res.end(JSON.stringify(result.error.details.map(d => d.message)));
      }

      await shared.dynamo.db.putItem({
        TableName: 'devices',
        Item: shared.dynamo.marshaller.marshallItem(requestBody)
      }).promise();

      const accessToken = await shared.auth.getAccessToken();
      await shared.device.update(accessToken, requestBody);

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
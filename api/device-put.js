const { parse } = require('url');
const parseBody = require('co-body');
const Joi = require('joi');
const shared = require('./shared');

const schema = Joi.object().keys({
  deviceId: Joi.string().alphanum().required(),
  deviceCode: Joi.string().alphanum().length(6).required(),
  piggySleep: Joi.object().keys({
    enabled: Joi.boolean(),
    wakeupTime: Joi.string().allow(null).empty(),
    sleepTime: Joi.string().allow(null).empty(),
    timezone: Joi.number(),
    observeDaylightSavings: Joi.boolean()
  }),
  allowance: Joi.object().keys({
    enabled: Joi.boolean(),
    amount: Joi.number().min(0).allow(null),
    depositSchedule: Joi.string().allow(null).empty()
  }),
  goals: Joi.array().length(4).required().items(Joi.object().keys({
    name: Joi.string(),
    enabled: Joi.boolean(),
    percentage: Joi.number().min(0).max(1).required(),
    color: Joi.number().integer().min(0).max(16777215),
    total: Joi.number().min(0).required(),
    current: Joi.number().min(0).max(Joi.ref('total')).required(),
    promise: Joi.number().min(0).max(Joi.ref('total')).required(),
    promises: Joi.array()
  }))
});

module.exports = async (req, res) => {
  try {
    shared.cors.setStandardHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      return res.end();
    } else if (req.method === 'PUT') {
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

      res.statusCode = 204;
      return res.end();
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

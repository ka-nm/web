const axios = require('axios');
const querystring = require('querystring');
const PromiseThrottle = require('promise-throttle');
const DynamoDb = require('aws-sdk/clients/dynamodb');
const { Marshaller } = require('@aws/dynamodb-auto-marshaller');

const clientId = process.env.PARTICLE_CLIENT_ID;
const marshaller = new Marshaller();
const db = new DynamoDb({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REG,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
});

module.exports = {
  dynamo: {
    db,
    marshaller
  },
  auth: {
    getAccessToken: async function () {
      const response = await db.getItem({
        TableName: 'tokens',
        Key: { clientId: { S: clientId } }
      }).promise();

      if (response.Item) {
        const clientToken = marshaller.unmarshallItem(response.Item);
        if (clientToken.expires > Date.now()) {
          console.log('%s: token valid', clientId);
          return clientToken.accessToken;
        }

        const refreshTokenResponse = await axios({
          method: 'post',
          url: 'https://api.particle.io/oauth/token',
          auth: {
            username: clientId,
            password: process.env.PARTICLE_CLIENT_SECRET,
          },
          data: querystring.stringify({
            grant_type: 'client_credentials',
            expires_in: 86400
          })
        });

        await updateClientToken(refreshTokenResponse.data.access_token, refreshTokenResponse.data.refresh_token);
        console.log('%s: token refresh', clientId);
        return refreshTokenResponse.data.access_token;
      } else {
        const tokenResponse = await axios({
          method: 'post',
          url: 'https://api.particle.io/oauth/token',
          auth: {
            username: clientId,
            password: process.env.PARTICLE_CLIENT_SECRET,
          },
          data: querystring.stringify({
            grant_type: 'client_credentials',
            expires_in: 86400
          })
        });

        await updateClientToken(tokenResponse.data.access_token, tokenResponse.data.refresh_token);
        console.log('%s: new token issued', clientId);
        return tokenResponse.data.access_token;
      }
    }
  },
  device: {
    async get(deviceId) {
      const data = await db.getItem({
        TableName: 'devices',
        Key: { deviceId: { S: deviceId } }
      }).promise();

      return data.Item ? marshaller.unmarshallItem(data.Item) : null;
    },
    async update(accessToken, device) {
      const requests = [];
      const throttle = new PromiseThrottle({ requestsPerSecond: 2, promiseImplementation: Promise });
      const baseOptions = {
        private: true,
        ttl: 86400, // 24hrs
        access_token: accessToken
      };

      requests.push(throttle.add(
        () => axios.post(
          'https://api.particle.io/v1/devices/events',
          querystring.stringify(Object.assign({}, baseOptions, {
            name: `${device.deviceId}/toggle`,
            data: device.goals.map(g => g.enabled ? 1 : 0).join('|')
          })))
      ));

      requests.push(throttle.add(
        () => axios.post(
          'https://api.particle.io/v1/devices/events',
          querystring.stringify(Object.assign({}, baseOptions, {
            name: `${device.deviceId}/color`,
            data: device.goals.map(g => g.color).join('|')
          })))
      ));

      requests.push(throttle.add(
        () => axios.post(
          'https://api.particle.io/v1/devices/events',
          querystring.stringify(Object.assign({}, baseOptions, {
            name: `${device.deviceId}/update`,
            data: device.goals
              .map(g => `${(g.current / g.total).toFixed(2)},${(g.promise / g.total).toFixed(2)}`)
              .join('|')
          })))
      ));

      await Promise.all(requests);
    }
  }
};

async function updateClientToken(accessToken, refreshToken) {
  const expires = Date.now() + (82800 * 1000); // 23hrs
  await db.putItem({
    TableName: 'tokens',
    Item: marshaller.marshallItem({
      clientId,
      accessToken,
      refreshToken,
      expires
    })
  }).promise();
}
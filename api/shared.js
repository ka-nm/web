const axios = require('axios');
const querystring = require('querystring');
const PromiseThrottle = require('promise-throttle');
const DynamoDb = require('aws-sdk/clients/dynamodb');
const { Marshaller } = require('@aws/dynamodb-auto-marshaller');

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
  cors: {
    setStandardHeaders: res => {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    }
  },
  token: {
    store: storeClientToken
  },
  auth0: {
    getAccessToken: async () => {
      const response = await db.getItem({
        TableName: 'tokens',
        Key: { clientId: { S: process.env.AUTH0_CLIENT_ID } }
      }).promise();

      if (response.Item) {
        const clientToken = marshaller.unmarshallItem(response.Item);
        if (clientToken.expires > Date.now()) {
          console.log('%s: token valid', process.env.AUTH0_CLIENT_ID);
          return clientToken.accessToken;
        }
      }

      const tokenResponse = await axios({
        method: 'post',
        url: 'https://digipiggy.auth0.com/oauth/token',
        data: {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: 'https://digipiggy.auth0.com/api/v2/',
          grant_type: 'client_credentials',
        }
      });

      await storeClientToken(process.env.AUTH0_CLIENT_ID, tokenResponse.data.access_token, null);
      console.log('%s: new token issued', process.env.AUTH0_CLIENT_ID);
      return tokenResponse.data.access_token;
    }
  },
  particle: {
    getAccessToken: async () => {
      const response = await db.getItem({
        TableName: 'tokens',
        Key: { clientId: { S: process.env.PARTICLE_CLIENT_ID } }
      }).promise();

      if (response.Item) {
        const clientToken = marshaller.unmarshallItem(response.Item);
        if (clientToken.expires > Date.now()) {
          console.log('%s: token valid', process.env.PARTICLE_CLIENT_ID);
          return clientToken.accessToken;
        }

        const refreshTokenResponse = await axios({
          method: 'post',
          url: 'https://api.particle.io/oauth/token',
          auth: {
            username: process.env.PARTICLE_CLIENT_ID,
            password: process.env.PARTICLE_CLIENT_SECRET,
          },
          data: querystring.stringify({
            grant_type: 'client_credentials',
            expires_in: 86400
          })
        });

        await storeClientToken(
          process.env.PARTICLE_CLIENT_ID,
          refreshTokenResponse.data.access_token,
          refreshTokenResponse.data.refresh_token);

        console.log('%s: token refresh', process.env.PARTICLE_CLIENT_ID);
        return refreshTokenResponse.data.access_token;
      } else {
        const tokenResponse = await axios({
          method: 'post',
          url: 'https://api.particle.io/oauth/token',
          auth: {
            username: process.env.PARTICLE_CLIENT_ID,
            password: process.env.PARTICLE_CLIENT_SECRET,
          },
          data: querystring.stringify({
            grant_type: 'client_credentials',
            expires_in: 86400
          })
        });

        await storeClientToken(
          process.env.PARTICLE_CLIENT_ID,
          tokenResponse.data.access_token,
          tokenResponse.data.refresh_token);

        console.log('%s: new token issued', process.env.PARTICLE_CLIENT_ID);
        return tokenResponse.data.access_token;
      }
    },
    updateDevice: async (accessToken, device) => {
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
  },
  device: {
    getById: async deviceId => {
      const data = await db.getItem({
        TableName: 'devices',
        Key: { deviceId: { S: deviceId } }
      }).promise();

      return data.Item ? marshaller.unmarshallItem(data.Item) : null;
    },
    getByCode: async deviceCode => {
      const data = await db.query({
        ExpressionAttributeValues: {
          ':code': {
            S: deviceCode
          }
        },
        IndexName: 'deviceCode-index',
        KeyConditionExpression: 'deviceCode = :code',
        Select: 'ALL_ATTRIBUTES',
        TableName: 'devices'
      }).promise();

      return data.Items.length ? marshaller.unmarshallItem(data.Items[0]) : null;
    }
  }
};

async function storeClientToken(clientId, accessToken, refreshToken) {
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
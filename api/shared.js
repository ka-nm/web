const axios = require('axios');
const querystring = require('querystring');
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
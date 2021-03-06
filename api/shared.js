const pify = require('pify');
const jwks = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const querystring = require('querystring');
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

const jwtVerify = pify(jwt.verify);
const jwksClient = jwks({
  cache: true,
  jwksUri: `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`
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
  auth0: {
    validateJwt: async req => {
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        return false;
      }

      const token = req.headers.authorization.split(' ')[1];
      try {
        return await jwtVerify(token, getJwksKey);
      } catch (err) {
        console.error(err);
        if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
          return false;
        }
      }
    },
    getAccessToken: async () => {
      const response = await db.getItem({
        TableName: 'tokens',
        Key: { clientId: { S: process.env.AUTH0_CLIENT_ID } }
      }).promise();

      if (response.Item) {
        const clientToken = marshaller.unmarshallItem(response.Item);
        console.log('%s: token valid', process.env.AUTH0_CLIENT_ID);
        return clientToken.accessToken;
      }

      const tokenResponse = await axios({
        method: 'post',
        url: `${process.env.AUTH0_BASE_URL}/oauth/token`,
        data: {
          client_id: process.env.AUTH0_CLIENT_ID,
          client_secret: process.env.AUTH0_CLIENT_SECRET,
          audience: `${process.env.AUTH0_BASE_URL}/api/v2/`,
          grant_type: 'client_credentials',
        }
      });

      await storeToken(process.env.AUTH0_CLIENT_ID, tokenResponse.data.access_token);
      console.log('%s: new token issued', process.env.AUTH0_CLIENT_ID);
      return tokenResponse.data.access_token;
    }
  },
  particle: {
    storeUserAccessToken: (email, accessToken) => storeToken(email, accessToken),
    getAccessToken: async email => {
      const id = email || process.env.DIGIPIGGY_CLIENT_ID;
      const response = await db.getItem({
        TableName: 'tokens',
        Key: { clientId: { S: id } }
      }).promise();

      if (response.Item) {
        const token = marshaller.unmarshallItem(response.Item);
        console.log('%s: token valid', id);
        return token.accessToken;
      }

      const params = {
        grant_type: 'client_credentials',
        expires_in: 86400
      };

      if (email) {
        params.scope = `customer=${email}`;
      }

      const tokenResponse = await axios({
        method: 'post',
        url: 'https://api.particle.io/oauth/token',
        auth: {
          username: process.env.DIGIPIGGY_CLIENT_ID,
          password: process.env.DIGIPIGGY_CLIENT_SECRET,
        },
        data: querystring.stringify(params)
      });

      await storeToken(id, tokenResponse.data.access_token);

      console.log('%s: new token issued', id);
      return tokenResponse.data.access_token;
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

function getJwksKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

async function storeToken(id, accessToken) {
  const expires = Math.floor(Date.now() / 1000) + 82800; // 23hrs
  await db.putItem({
    TableName: 'tokens',
    Item: marshaller.marshallItem({
      clientId: id,
      accessToken,
      expires
    })
  }).promise();
}
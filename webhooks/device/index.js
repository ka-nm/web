const parseBody = require('co-body');
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

// TODO: implement proper logging (e.g. not just to console)
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    console.error('Invalid HTTP method');
    res.statusCode = 204;
    return res.end();
  }

  if (!req.headers['webhook-id'] || req.headers['webhook-id'] !== process.env.WEBHOOK_ID) {
    console.error('Unauthorized');
    res.statusCode = 204;
    return res.end();
  }

  try {
    const body = await parseBody.json(req);
    if (body.event !== 'device/online') {
      console.error('Unsupported event: %s', body.event);
      res.statusCode = 204;
      return res.end();
    }

    const buckets = await getBucketValues(body.coreid);
    if (!buckets) {
      console.error('Invalid device: %s', body.deviceId);
      res.statusCode = 204;
      return res.end();
    }

    console.log('Sending bucket updates: %o', buckets);
    const accessToken = await getAccessToken();
    const axiosBuckets = axios.create();
    throttleRequests(axiosBuckets, 100);

    await Promise.all(
      buckets.map((b, i) => axiosBuckets.post(
        'https://api.particle.io/v1/devices/events',
        querystring.stringify({
          name: `${body.coreid}/update`,
          data: `${(i + 1)}|${b.value}|${b.promise}`,
          private: true,
          ttl: 86400, // 24hrs
          access_token: accessToken
        }))
      ));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }

  res.statusCode = 200;
  return res.end('OK');
}

async function getBucketValues(deviceId) {
  const response = await db.getItem({
    TableName: 'devices',
    Key: { deviceId: { S: deviceId } }
  }).promise();

  if (!response.Item) {
    return null;
  }

  const device = marshaller.unmarshallItem(response.Item);
  return device.data.map(d => {
    return {
      value: (d.current / d.total).toFixed(2),
      promise: (d.promise / d.total).toFixed(2)
    };
  });
}

async function getAccessToken() {
  const response = await db.getItem({
    TableName: 'tokens',
    Key: { clientId: { S: clientId } }
  }).promise();

  if (response.Item) {
    const clientToken = marshaller.unmarshallItem(response.Item)
    if (clientToken.expires < Date.now()) {
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

async function updateClientToken(accessToken, refreshToken) {
  await db.putItem({
    TableName: 'tokens',
    Item: marshaller.marshallItem({
      clientId: clientId,
      accessToken,
      refreshToken,
      expires: Date.now() + 82800 // 23hrs
    })
  }).promise();
}

function throttleRequests(axiosInstance, delay) {
  let nextAllowedRequest;
  axiosInstance.interceptors.request.use(config => {
    const now = Date.now();
    if (nextAllowedRequest) {
      nextAllowedRequest += delay;
      const requestDelay = nextAllowedRequest - now;
      if (requestDelay > 0) {
        return new Promise(resolve => setTimeout(() => resolve(config), requestDelay));
      }
    }

    nextAllowedRequest = now;
    return config;
  }, error => {
    // TODO: API rate limit of approximately 10 calls per second to api.particle.io
    // from each public IP address - need to account for 429s
    if (error.response.status === 429) {
      console.error('Request throttled');
    }

    return Promise.reject(error);
  });
}
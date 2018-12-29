const pify = require('pify');
const jwks = require('jwks-rsa');
const jwt = require('jsonwebtoken');
const shared = require('./shared');

const jwksClient = jwks({
  cache: true,
  jwksUri: `${process.env.AUTH0_BASE_URL}/.well-known/jwks.json`
});

const jwtVerify = pify(jwt.verify);

module.exports = async (req, res) => {
  try {
    shared.cors.setStandardHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      return res.end();
    } else if (req.method === 'GET') {
      if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
        res.statusCode = 401;
        return res.end('Unauthorized');
      }

      const token = req.headers.authorization.split(' ')[1];
      const decoded = await jwtVerify(token, getKey);
      const accessToken = await shared.particle.getAccessToken(decoded.email);

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(JSON.stringify({ token: accessToken }));
    } else {
      res.statusCode = 405;
      return res.end();
    }
  } catch (err) {
    console.error(err);
    if (err instanceof jwt.TokenExpiredError || err instanceof jwt.JsonWebTokenError) {
      res.statusCode = 401;
      return res.end('Unauthorized');
    }

    res.statusCode = 500;
    return res.end('Unexpected Error');
  }
};

function getKey(header, callback) {
  jwksClient.getSigningKey(header.kid, function (err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}
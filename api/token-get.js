const shared = require('./shared');

module.exports = async (req, res) => {
  try {
    shared.cors.setStandardHeaders(res);

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.setHeader('Content-Length', '0');
      return res.end();
    } else if (req.method === 'GET') {
      // validate the jwt against auth0
      // basically check who the person is who they say they are
      const jwtPayload = await shared.auth0.validateJwt(req);
      if (!jwtPayload) {
        res.statusCode = 401;
        return res.end('Unauthorized');
      }
      console.log("token-get process.env", process.env)

      // get the access token to the particle api
      // this is stored in the aws tokens db in the person's email
      const accessToken = await shared.particle.getAccessToken(jwtPayload.email);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.end(JSON.stringify({ token: accessToken }));
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
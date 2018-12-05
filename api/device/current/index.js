const { parse } = require('url');
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

module.exports = async (req, res) => {
  const { query } = parse(req.url, true);
  try {
    const data = await db.getItem({
      TableName: 'devices',
      Key: { deviceId: { S: query.deviceId } }
    }).promise();

    if (!data.Item) {
      res.statusCode = 404;
      return res.end('Not Found');
    }

    res.end(JSON.stringify(marshaller.unmarshallItem(data.Item)));
  } catch (err) {
    console.log(err);
    res.statusCode = 500;
    return res.end('Unexpected Error');
  }
}
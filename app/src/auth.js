import Vue from 'vue';
import auth0 from 'auth0-js';
import axios from 'axios';
import DynamoDb from 'aws-sdk/clients/dynamodb';
import { Marshaller } from '@aws/dynamodb-auto-marshaller';

const baseUrl = process.env.VUE_APP_API_BASE_URL || '';
const marshaller = new Marshaller();
const db = new DynamoDb({
  apiVersion: '2012-08-10',
  region: process.env.AWS_REG,
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
});

class AuthService {
  accessToken;
  idToken;
  expiresAt;
  email;
  auth0 = new auth0.WebAuth({
    domain: process.env.VUE_APP_AUTH0_DOMAIN,
    clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
    redirectUri: `${process.env.VUE_APP_AUTH0_REDIRECT_BASE_URL}/callback`,
    responseType: 'id_token',
    scope: 'openid email'
  });

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt && Vue.ls.get('isAuthenticated');
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    return new Promise((resolve, reject) => {
      this.auth0.parseHash( async (err, authResult) => {
        if (err) {
          console.log("real error")
          await storeError(err);
          return reject(err);
        }

        if (authResult && authResult.idToken) {
          axios.get(`${baseUrl}/api/token`, {
            headers: { Authorization: `Bearer ${authResult.idToken}` }
          }).then(async response => {
            authResult.accessToken = response.data.token;
            this.setSession(authResult);
            console.log("fake error")
            console.log("process.env", process.env)
            await storeError(authResult);
            resolve();
          }).catch(err => reject(err));
        }
      });
    });
  }

  setSession(authResult) {
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = authResult.idTokenPayload.exp * 1000;
    this.email = authResult.idTokenPayload.email;

    Vue.ls.set('isAuthenticated', true);
  }

  renewSession() {
    return new Promise((resolve, reject) => {
      this.auth0.checkSession({}, (err, authResult) => {
        if (err) {
          return reject(err);
        }

        if (authResult && authResult.idToken) {
          this.$http.get(`${baseUrl}/api/token`, {
            headers: { Authorization: `Bearer ${authResult.idToken}` }
          }).then(response => {
            authResult.accessToken = response.data.token;
            this.setSession(authResult);
            resolve();
          }).catch(err => reject(err));
        }
      });
    });
  }

  logout() {
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = null;

    Vue.ls.remove('isAuthenticated');
    this.auth0.logout({
      clientID: process.env.VUE_APP_AUTH0_CLIENT_ID,
      returnTo: process.env.VUE_APP_AUTH0_REDIRECT_BASE_URL
    });
  }
}

async function storeError(err) {
    console.log("err", err);
    await db.putItem({
      TableName: 'loginErrors',
      Item: marshaller.marshallItem({
        err
      })
    }).promise();
}

export default new AuthService();

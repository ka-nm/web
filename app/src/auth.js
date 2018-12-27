import auth0 from 'auth0-js';
import EventEmitter from 'eventemitter3';
import router from './router';

class AuthService {
  accessToken;
  idToken;
  expiresAt;
  authenticated = this.isAuthenticated();
  authNotifier = new EventEmitter();
  auth0 = new auth0.WebAuth({
    domain: 'digipiggy.auth0.com',
    clientID: 'wKjIughqwOOWz9muGYE7I12ZG32Tuknw',
    redirectUri: 'http://localhost:8080/callback',
    responseType: 'token id_token',
    scope: 'openid'
  });

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        router.replace('home');
      } else if (err) {
        router.replace('home');
        console.log(err);
        alert(`Error: ${err.error} - check the console for further details`)
      }
    });
  }

  setSession(authResult) {
    this.accessToken = authResult.accessToken;
    this.idToken = authResult.idToken;
    this.expiresAt = authResult.expiresIn * 1000 + new Date().getTime();

    this.authNotifier.emit('authChange', { authenticated: true });

    localStorage.setItem('loggedIn', true);
  }

  renewSession() {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
      } else if (err) {
        this.logout();
        console.log(err);
        alert(`Could not get a new token (${err.error}: ${err.error_description})`);
      }
    });
  }

  logout() {
    this.accessToken = null;
    this.idToken = null;
    this.expiresAt = null;

    this.userProfile = null;
    this.authNotifier.emit('authChange', false);

    localStorage.removeItem('loggedIn');
    router.replace('home');
  }

  isAuthenticated() {
    return new Date().getTime() < this.expiresAt && localStorage.getItem('loggedIn') === 'true';
  }
}

export default new AuthService();
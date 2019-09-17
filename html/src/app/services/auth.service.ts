import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';

import { Auth } from '../models/auth.model';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

import * as jwt_decode from 'jwt-decode';

@Injectable()
export class AuthService {

  public auth: Auth = null;
  public authPublic: Auth = null;

  constructor() {}

  setAuthCookie(token: any, expiration: any) {
    const _token = jwt_decode(token);
    const auth = _token.sub;

    localStorage.setItem('_token', btoa(token));
    localStorage.setItem('_user', btoa(JSON.stringify(auth.user)));
    localStorage.setItem('_expiry', btoa(expiration));

    this.auth = auth;
  }

  /**
   * The following 3 functions are intended for
   * redirection after login
   */
  setRedirectCookie(url: any) {
    localStorage.setItem('_rUrl', btoa(url));
  }

  getRedirectCookie() {
    if (localStorage['_rUrl']) {
      return atob(localStorage.getItem('_rUrl'));
    }

    return '';
  }

  unsetRedirectCookie() {
    if (localStorage['_rUrl']) {
      localStorage.removeItem('_rUrl');
    }
  }

  getAuthCookie() {
    let auth: Auth;

    if (localStorage['_user']) {
      const user =  JSON.parse(atob(localStorage.getItem('_user')));

      auth = {
         user: user
      };
  
      this.auth = auth;
    }
  }

  updateAuthCookieField(name: string, data: string) {
    localStorage.setItem('qaAuth' + name, btoa(data));


    if ( name === 'user') {
      this.auth[name] = JSON.parse(data);
    } else {
      this.auth[name] = data;
    }
  }

  checkAuthCookie() {
    return this.checkAuthToken();
  }

  deleteAuthCookie() {
    // localStorage.clear();
    localStorage.removeItem('_token');
    localStorage.removeItem('_expiry');
    localStorage.removeItem('_user');
    localStorage.removeItem('_client');
    this.auth = null;
  }

  checkAuthToken() {
    const token = localStorage.getItem('_user');

    if(token === null || typeof token === 'undefined' || token.trim() === ''){
      return false;
    }

    return true;
  }

  getToken() {
    const token = atob(localStorage.getItem('_token'));

    return token;
  }

  getExpiration() {
    const expiry = atob(localStorage.getItem('_expiry'));

    return expiry;
  }

  /**
   * The following functions will be used for WorkPattern (Public user) Authentication
   */

  setAuthCookiePublic(token: any, expiration: any, hash: any) {
    const _token = jwt_decode(token);
    const authPublic = _token.sub;

    localStorage.setItem('_token_public', btoa(token));
    localStorage.setItem('_user_public', btoa(JSON.stringify(authPublic.user)));
    localStorage.setItem('_expiry_public', btoa(expiration));
    localStorage.setItem('_hash_public', btoa(hash));

    this.authPublic = authPublic;
  }

  getAuthCookiePublic() {
    let authPublic: Auth;

    if (localStorage['_user_public']) {
      const user =  JSON.parse(atob(localStorage.getItem('_user_public')));

      authPublic = {
         user: user
      };
  
      this.authPublic = authPublic;
    }
  }

  checkAuthCookiePublic() {
    return this.checkAuthTokenPublic();
  }

  deleteAuthCookiePublic() {
    localStorage.removeItem('_token_public');
    localStorage.removeItem('_expiry_public');
    localStorage.removeItem('_user_public');
    localStorage.removeItem('_hash_public');
    this.authPublic = null;
  }

  checkAuthTokenPublic() {
    const token = localStorage.getItem('_user_public');
    if(token === null || typeof token === 'undefined' || token.trim() === ''){
      return false;
    }
    return true;
  }

  getTokenPublic() {
    return atob(localStorage.getItem('_token_public'));
  }

  getExpirationPublic() {
    return atob(localStorage.getItem('_expiry_public'));
  }

  getHashPublic() {
    return atob(localStorage.getItem('_hash_public'));
  }

}

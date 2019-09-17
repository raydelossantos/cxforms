import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams, HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';
import { AuthService } from './auth.service';
import { Auth } from '../models/auth.model';
import { stringify } from 'querystring';

@Injectable()
export class LoginService {
  LDapAuthLogin         = new Subject<any>();
  LDapAuthUnblockLogin  = new Subject<any>();

  constructor(
    @Inject(APP_CONFIG) private appConfig,
    private httpClient: HttpClient,
    public authService: AuthService) { }

  httpPostLdapLogin(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/auth/login',
      data
    );

    return this.httpClient.request<any>(req)
    .map(
      (response: any) => {
        if (typeof(response) !== 'undefined' && response.body != null) {
          return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.LDapAuthLogin.next(response);
      },
      (response: any) => {
        this.LDapAuthLogin.next(response.error);
      }
    );
  }

  httpGetUnblockLogin(username: string, hash: string) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/auth/unblock/' + username + '/' + hash
    );

    return this.httpClient.request<any>(req)
    .map(
      (response: any) => {
        if (typeof(response) !== 'undefined' && response.body != null) {
          return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.LDapAuthUnblockLogin.next(response);
      },
      (response: any) => {
        this.LDapAuthUnblockLogin.next(response.error);
      }
    );
  }
}
 
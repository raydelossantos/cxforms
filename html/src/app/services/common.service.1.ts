import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class CommonService {

  statsGetAll     = new Subject<any>();
  userFormGet     = new Subject<any>();
  userClientGet   = new Subject<any>();
  forms: any      = [];

  constructor(
    @Inject(APP_CONFIG) private appConfig,
            private httpClient: HttpClient) { }

  httpGetAllStats() {

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/common/stats'
    );

    return this.httpClient.request(req)
    .map(
      (response: any) => {
        if (typeof response.body !== 'undefined' && response.body != null) {
            return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.statsGetAll.next(response);
      },
      (response: any) => {
        this.statsGetAll.next(response.error);
      }
    );
  }

  httpGetUserForms(client_id: any) {

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/common/user/' + client_id + '/forms'
    );

    return this.httpClient.request(req)
    .map(
      (response: any) => {
        if (typeof response.body !== 'undefined' && response.body != null) {
            return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.forms = response.data;
        this.userFormGet.next(response);
      },
      (response: any) => {
        this.userFormGet.next(response.error);
      }
    );
  }
  
  httpGetUserClients() {

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/common/user/clients'
    );

    return this.httpClient.request(req)
    .map(
      (response: any) => {
        if (typeof response.body !== 'undefined' && response.body != null) {
            return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.forms = response.data;
        this.userClientGet.next(response);
      },
      (response: any) => {
        this.userClientGet.next(response.error);
      }
    );
  }

}

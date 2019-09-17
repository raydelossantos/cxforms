import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class SidebarService {
    FormCreatedSuccess = new Subject<any>();
    FormCreatedInvalid = new Subject<any>();

    constructor(
        @Inject(APP_CONFIG) private appConfig,
        private httpClient: HttpClient) { }

    httpPostCreateForm(data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/form',
            data
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            console.log(response.body);
            if (response.body) {
                if (response.body.status === 'success') {
                    return response.body;
                } else if (response.body.status === 'invalid' || response.body.status === 'error') {
                    this.FormCreatedInvalid.next(response);
                } 
            }
            return [];
        })
        .subscribe(
        (response: any) => {
            this.FormCreatedSuccess.next(response);
        });    
    }

    // httpPost
}
 
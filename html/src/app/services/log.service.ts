import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { APP_CONFIG } from '../app.config';
import 'rxjs/Rx';

@Injectable()
export class LogService {
    mailGetAll           = new Subject<any>();
    userGetAll           = new Subject<any>();
    filterGetAll         = new Subject<any>();
    mailFilterGetAll     = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    httpGetAllMailLogs(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/log/mail',
            {
                params: httpParams
            }
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
                this.mailGetAll.next(response);
            },
            (response: any) => {
                this.mailGetAll.next(response.error);
            }
        );
    }

    httpGetAllUserLogs(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/log/user',
            {
                params: httpParams
            }
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
                this.userGetAll.next(response);
            },
            (response: any) => {
                this.userGetAll.next(response.error);
            }
        );
    }

    httpPostFilter(data: any) {
        const req = new HttpRequest('POST',
            this.appConfig.API_ENDPOINT + '/log/user/filter',
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    if (response.body.success) {
                        return response.body;
                    }

                    return [];
                }
            }
        )
        .subscribe(
            (response: any) => {
                this.filterGetAll.next(response);
            },
            (response: any) => {
                this.filterGetAll.next(response.error);
            }
        )
    }

    httpPostFilterMail(data: any) {
        const req = new HttpRequest('POST',
            this.appConfig.API_ENDPOINT + '/log/mail/filter',
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    if (response.body.success) {
                        return response.body;
                    }

                    return [];
                }
            }
        )
        .subscribe(
            (response: any) => {
                this.mailFilterGetAll.next(response);
            },
            (response: any) => {
                this.mailFilterGetAll.next(response.error);
            }
        );
    }
}

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { APP_CONFIG } from '../app.config';
import 'rxjs/Rx';

@Injectable()
export class NotificationService {
    notificationGetAll          = new Subject<any>();
    notificationPut             = new Subject<any>();
    notificationDelete          = new Subject<any>();
    notificationDeleteAll       = new Subject<any>();
    notificationPutMarkAll      = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    httpGetAllNotification(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/notification',
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
                this.notificationGetAll.next(response);
            },
            (response: any) => {
                this.notificationGetAll.next(response.error);
            }
        );
    }

    httpMarkAllReadNotification(user_id: number) {

        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/notification/mark_all',
            { user_id: user_id }
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
                this.notificationPutMarkAll.next(response);
            },
            (response: any) => {
                this.notificationPutMarkAll.next(response.error);
            }
        );
    }

    httpMarkAsReadNotification(id: number, user_id: number) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/notification/' + id,
            { user_id: user_id }
        );

        return this.httpClient.request<any>(req)
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
                this.notificationPut.next(response);
            },
            (response: any) => {
                this.notificationPut.next(response.error);
            }
        );
    }

    httpDeleteAllNotification(user_id: number) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/notification/delete_all'
        );

        return this.httpClient.request<any>(req)
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
                this.notificationDeleteAll.next(response);
            },
            (response: any) => {
                this.notificationDeleteAll.next(response.error);
            }
        );
    }

    httpDeleteNotification(id: number, user_id: number) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/notification/' + id
        );

        return this.httpClient.request<any>(req)
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
                this.notificationDelete.next(response);
            },
            (response: any) => {
                this.notificationDelete.next(response.error);
            }
        );
    }

}
 
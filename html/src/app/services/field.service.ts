import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class FieldService {

    fieldGet            = new Subject<any>();
    fieldGetAll         = new Subject<any>();
    fieldPost           = new Subject<any>();
    fieldPut            = new Subject<any>();
    fieldDelete         = new Subject<any>();
    fieldPostSort       = new Subject<any>();
    formGetDeletedFields= new Subject<any>();
    restoreField        = new Subject<any>();

    constructor(
        @Inject(APP_CONFIG) private appConfig,
        private httpClient: HttpClient) { }

    httpGetAllField(params: any = [], form_id: any) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/field/' + form_id,
            {
                params: httpParams
            }
        );

        return this.httpClient.request(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body !== null) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldGetAll.next(response);
            },
            (response: any) => {
                this.fieldGetAll.next(response.error)
            }
        );
    }

    httpGetField(id: any, form_id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/field/' + form_id + '/' + id
        );

        return this.httpClient.request(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body !== null) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldGet.next(response);
            },
            (response: any) => {
                this.fieldGet.next(response.error)
            }
        );
    }

    httpPostField(data: any, form_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/field/' + form_id,
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldPost.next(response);
            },
            (response: any) => {
                this.fieldPost.next(response.error);
            }
        );    
    }

    httpPostSorting(data: any, form_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/field/' + form_id + '/sort',
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldPostSort.next(response);
            },
            (response: any) => {
                this.fieldPostSort.next(response.error);
            }
        );    
    }

    httpPutField(id: number, data: any, form_id) {
        /** Update field service */
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/field/' + form_id + '/' + id,
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    return response.body;
                }
    
                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldPut.next(response);
            },
            (response: any) => {
                this.fieldPut.next(response.error);
            }
        );
    }

    httpDeleteField(id: any, form_id) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/field/' + form_id + '/' + id
        );

        return this.httpClient.request(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.fieldDelete.next(response);
            },
            (response: any) => {
                this.fieldDelete.next(response.error)
            }
        );
    }

    /**
     * When selecting ADD New Form, clear form & fields
     */
    clearFields() {

        let _fields = {
            'success': true,
            'count': 0,
            'data': []
        };

        this.fieldGetAll.next(_fields);
    }

    httpGetDeleted(id: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/field/' + id + '/get_deleted'
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
                this.formGetDeletedFields.next(response);
            },
            (response: any) => { 
                this.formGetDeletedFields.next(response.error);
            }
        );
    }

    httpRestore(data: any) {
        const req = new HttpRequest (
            'PUT',
            this.appConfig.API_ENDPOINT + '/field/' + data.form_id + '/restore',
            data
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
                this.restoreField.next(response);
            },
            (response: any) => { 
                this.restoreField.next(response.error);
            }
        );
    }
}
 
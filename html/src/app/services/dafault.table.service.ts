import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class DefaultTableService {

    recordPost          = new Subject<any>();
    recordGet           = new Subject<any>();
    recordGetView       = new Subject<any>();
    recordGetAll        = new Subject<any>();
    recordPut           = new Subject<any>();
    recordPutView       = new Subject<any>();
    recordExport        = new Subject<any>();
    recordDelete        = new Subject<any>();
    attachmentDelete    = new Subject<any>();
    recordTagGetAll     = new Subject<any>();
    recordTagDelete     = new Subject<any>();
    recordSearchPost    = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    httpGetAllRecords(form_id: number, params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/default/' + form_id,
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
                this.recordGetAll.next(response);
            },
            (response: any) => {
                this.recordGetAll.next(response.error)
            }
        );
    }
    
    httpGetRecord(form_id: any, record_id: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id
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
                this.recordGet.next(response);
            },
            (response: any) => {
                this.recordGet.next(response.error)
            }
        );
    }

    httpGetRecordView(form_id: any, record_id: any, hash: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id + '/' + hash
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
                this.recordGetView.next(response);
            },
            (response: any) => {
                this.recordGetView.next(response.error)
            }
        );
    }

    httpPostRecord(form_id: number, data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/default/' + form_id,
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
                this.recordPost.next(response);
            },
            (response: any) => {
                this.recordPost.next(response.error);
            }
        );    
    }

    httpPostRecordPublic(form_id: number, data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/public/default/' + form_id,
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
                this.recordPost.next(response);
            },
            (response: any) => {
                this.recordPost.next(response.error);
            }
        );    
    }

    httpPutRecord(form_id: number, record_id: any, data: any) {
        /** Update Record service */
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id,
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
                this.recordPut.next(response);
            },
            (response: any) => {
                this.recordPut.next(response.error);
            }
        )
    }

    httpPutRecordView(form_id: number, record_id: any, hash: any, data: any) {
        /** Update Record on VIEW RECORD */
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id + '/' + hash,
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
                this.recordPutView.next(response);
            },
            (response: any) => {
                this.recordPutView.next(response.error);
            }
        )
    }

    httpDeleteRecord(form_id: number, record_id: any) {
        /** Delete Record */
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id
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
                this.recordDelete.next(response);
            },
            (response: any) => {
                this.recordDelete.next(response.error);
            }
        )
    }

    httpDeleteAttachment(form_id: number, record_id: any, a_id: number) {
        /** Delete Record */
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id + '/a/' + a_id
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
                this.attachmentDelete.next(response);
            },
            (response: any) => {
                this.attachmentDelete.next(response.error);
            }
        )
    }

    httpPostExportData(form_id: number, data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/export/' + form_id,
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response.body) !== 'undefined' && response.body.success) {
                    if (response.body.success) {
                        return response.body;
                    } else {
                        this.recordExport.next(response);
                    }
    
                    return [];
                }
            }
        )
        .subscribe(
            (response: any) => {
                this.recordExport.next(response);
            },
            (response: any) => {
                this.recordExport.next(response.error);
            }
        )
    }

    httpPostSearch(form_id: number, data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/search/' + form_id,
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
                this.recordGetAll.next(response);
            },
            (response: any) => {
                this.recordGetAll.next(response.error);
            }
        )
    }

    // Get All Record User Tags
    httpGetTagList(form_id: any, record_id: any) {

        let httpParams = new HttpParams();

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id + '/tags/get',
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
                this.recordTagGetAll.next(response);
            },
            (response: any) => {
                this.recordTagGetAll.next(response.error);
            }
        );
    }

    httpDeleteTag(form_id: any, record_id: any, tag_id: any) {

        let httpParams = new HttpParams();

        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/default/' + form_id + '/' + record_id + '/tags/' + tag_id
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
                this.recordTagDelete.next(response);
            },
            (response: any) => {
                this.recordTagDelete.next(response.error);
            }
        );
    }


}
 
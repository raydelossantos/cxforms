import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class PermissionService {

    userPermissionGet            = new Subject<any>();
    userPermissionGetAll         = new Subject<any>();
    userPermissionPost           = new Subject<any>();
    userPermissionPut            = new Subject<any>();
    userPermissionDelete         = new Subject<any>();

    teamPermissionGet            = new Subject<any>();
    teamPermissionGetAll         = new Subject<any>();
    teamPermissionPost           = new Subject<any>();
    teamPermissionPut            = new Subject<any>();
    teamPermissionDelete         = new Subject<any>();
    userPermissionBatchPut       = new Subject<any>();
    teamPermissionBatchPut       = new Subject<any>();

    formPermissions              = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    /**
     * USER PERMISSION SERVICES
     */
    
    httpGetAllUserPermission(params: any = [], form_id: any) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user',
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
                this.userPermissionGetAll.next(response);
            },
            (response: any) => {
                this.userPermissionGetAll.next(response.error)
            }
        );
    }

    httpGetUserPermission(id: any, form_id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user/' + id
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
                this.userPermissionGet.next(response);
            },
            (response: any) => {
                this.userPermissionGet.next(response.error)
            }
        );
    }

    httpPostUserPermission(data: any, form_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user',
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
                this.userPermissionPost.next(response);
            },
            (response: any) => {
                this.userPermissionPost.next(response.error);
            }
        );    
    }

    httpPutUserPermission(id: any, data: any, form_id: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user/' + id,
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
                this.userPermissionPut.next(response);
            },
            (response: any) => {
                this.userPermissionPut.next(response.error);
            }
        );
    }

    httpPutUserPermissionBatch(data: any, form_id: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user/batch',
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
                this.userPermissionBatchPut.next(response);
            },
            (response: any) => {
                this.userPermissionBatchPut.next(response.error);
            }
        );
    }

    httpDeleteUserPermission(id: any, form_id: any) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/user/' + id
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
                this.userPermissionDelete.next(response);
            },
            (response: any) => {
                this.userPermissionDelete.next(response.error)
            }
        );
    }

    /**
     * TEAM PERMISSION SERVICES
     */

    httpGetAllTeamPermission(params: any = [], form_id: any) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team',
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
                this.teamPermissionGetAll.next(response);
            },
            (response: any) => {
                this.teamPermissionGetAll.next(response.error)
            }
        );
    }

    httpGetTeamPermission(id: any, form_id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team/' + id
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
                this.teamPermissionGet.next(response);
            },
            (response: any) => {
                this.teamPermissionGet.next(response.error)
            }
        );
    }

    httpPostTeamPermission(data: any, form_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team',
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
                this.teamPermissionPost.next(response);
            },
            (response: any) => {
                this.teamPermissionPost.next(response.error);
            }
        );    
    }

    httpPutTeamPermission(id: any, data: any, form_id: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team/' + id,
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
                this.teamPermissionPut.next(response);
            },
            (response: any) => {
                this.teamPermissionPut.next(response.error);
            }
        );
    }

    httpPutTeamPermissionBatch(data: any, form_id: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team/batch',
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
                this.teamPermissionBatchPut.next(response);
            },
            (response: any) => {
                this.teamPermissionBatchPut.next(response.error);
            }
        );
    }

    httpDeleteTeamPermission(id: any, form_id: any) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/permission/' + form_id + '/team/' + id
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
                this.teamPermissionDelete.next(response);
            },
            (response: any) => {
                this.teamPermissionDelete.next(response.error)
            }
        );
    }

}
 
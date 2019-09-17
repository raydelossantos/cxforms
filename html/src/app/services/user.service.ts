import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';

@Injectable()
export class UserService {
    userPost                = new Subject<any>();
    userPut                 = new Subject<any>();
    userPostSync            = new Subject<any>();
    userGet                 = new Subject<any>();
    userGetAll              = new Subject<any>();
    userDelete              = new Subject<any>();
    userGetAllDeleted       = new Subject<any>();
    
    adminGetAll             = new Subject<any>();
    adminPost               = new Subject<any>();
    adminDelete             = new Subject<any>();
    adminGet                = new Subject<any>();
    adminPut                = new Subject<any>();
    userPutUnblock          = new Subject<any>();
    userPutRestore          = new Subject<any>();
    userGetAllInvalidLogin  = new Subject<any>();
    userGetAllNotInForm     = new Subject<any>();
    userGetAllNotInClient   = new Subject<any>();
    userGetAllNotInLob      = new Subject<any>();
    
    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    httpPostCreateUser(data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/user/create',
            data
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
                this.userPost.next(response);
            },
            (response: any) => {          
                this.userPost.next(response.error);
            }
        );    
    }

    httpPutUser(user_id: any, data: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/user/' + user_id,
            data
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            if (typeof response.body !== 'undefined' && response.body != null) {
                return response.body;
            }
            return [];
        })
        .subscribe(
            (response: any) => {
                this.userPut.next(response);
            },
            (response: any) => {
                this.userPut.next(response.error);
            }
        );
    }

    httpGetAllUser(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/user_info',
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

    httpGetAllDeletedUser(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/deleted',
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
                this.userGetAllDeleted.next(response);
            },
            (response: any) => {
                this.userGetAllDeleted.next(response.error);
            }
        );
    }    

    httpGetUserById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/' + id
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
                this.userGet.next(response);
            },
            (response: any) => {
                this.userGet.next(response.error);
            }
        );
    }

    httpDeleteUser(id: any) {

        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/user/' + id
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
                this.userDelete.next(response);
            },
            (response: any) => {
                this.userDelete.next(response.error);
            }
        );
    }

    httpPostSyncUser(data: any = []) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/user/batch',
            data
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
                this.userPostSync.next(response);
            },
            (response: any) => {
                this.userPostSync.next(response.error);
            }
        );
    }

    /**
     * Service function to unblock user
     * Set login_attempt to 0 (from 5)
     * @param user_id
     */
    httpPostUserUnblock(user_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/user/unblock',
            {id: user_id}
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            if (typeof response.body !== 'undefined' && response.body != null) {
                return response.body;
            }
            return [];
        })
        .subscribe(
            (response: any) => {
                this.userPutUnblock.next(response);
            },
            (response: any) => {
                this.userPutUnblock.next(response.error);
            }
        );
    }

    /**
     * Service function to restore user (undelete)
     * Set login_attempt to 0 (from 5)
     * @param user_id
     */
    httpPostUserRestore(user_id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/user/restore',
            {id: user_id}
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            if (typeof response.body !== 'undefined' && response.body != null) {
                return response.body;
            }
            return [];
        })
        .subscribe(
            (response: any) => {
                this.userPutRestore.next(response);
            },
            (response: any) => {
                this.userPutRestore.next(response.error);
            }
        );
    }

    httpGetAllInvalidLogins() {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/invalid',
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            if (typeof response.body !== 'undefined' && response.body != null) {
                return response.body;
            }
            return [];
        })
        .subscribe(
            (response: any) => {
                this.userGetAllInvalidLogin.next(response);
            },
            (response: any) => {
                this.userGetAllInvalidLogin.next(response.error);
            }
        );
    }

    httpGetAllUserNotInForm(form_id: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/form/' + form_id
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
                this.userGetAllNotInForm.next(response);
            },
            (response: any) => {
                this.userGetAllNotInForm.next(response.error);
            }
        );
    }

    httpGetAllUserNotInClient(client_id: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/client/' + client_id
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
                this.userGetAllNotInClient.next(response);
            },
            (response: any) => {
                this.userGetAllNotInClient.next(response.error);
            }
        );
    }

    httpGetAllUserNotInLob(lob_id: any) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/user/lob/' + lob_id
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
                this.userGetAllNotInLob.next(response);
            },
            (response: any) => {
                this.userGetAllNotInLob.next(response.error);
            }
        );
    }

    /**
     * ADMIN SERVICES STARTS HERE
     * requests that concerns admin API endpoints
     */
    httpGetAllAdmin(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/admin/admin_info',
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
                this.adminGetAll.next(response);
            },
            (response: any) => {
                this.adminGetAll.next(response.error);
            }
        );
    }

    httpPostCreateAdmin(data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/admin',
            data
        );

        return this.httpClient.request<any>(req)
        .map(
            (response: any) => {
                if (typeof(response) !== 'undefined' && response.body !== null) {
                    return response.body;
                }

                return [];
            }
        )
        .subscribe(
            (response: any) => {
                this.adminPost.next(response);
            },
            (response: any) => {
                this.adminPost.next(response.error);
            }
        )
    }

    httpGetAdminById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/admin/' + id
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
                this.adminGet.next(response);
            },
            (response: any) => {
                this.adminGet.next(response.error);
            }
        );
    }

    httpPutAdmin(user_id: any, data: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/admin/' + user_id,
            data
        );

        return this.httpClient.request<any>(req)
        .map(
        (response: any) => {
            if (typeof response.body !== 'undefined' && response.body != null) {
                return response.body;
            }
            return [];
        })
        .subscribe(
            (response: any) => {
                this.adminPut.next(response);
            },
            (response: any) => {
                this.adminPut.next(response.error);
            }
        );
    }

    httpDeleteAdmin(id: any) {

        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/admin/' + id
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
                this.adminDelete.next(response);
            },
            (response: any) => {
                this.adminDelete.next(response.error);
            }
        );
    }

}
 
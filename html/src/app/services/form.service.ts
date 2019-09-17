import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';
import { LOBService } from './lob.service';

@Injectable()
export class FormService {
    formPost            = new Subject<any>();
    formPut             = new Subject<any>();
    formGet             = new Subject<any>();
    formGetTableName    = new Subject<any>();
    formDelete          = new Subject<any>();
    formGetAcl          = new Subject<any>();
    formGetPermissions  = new Subject<any>();
    formGetAllDeleted   = new Subject<any>();
    formPostRestore     = new Subject<any>();
    formAcl:any         = [];

    formGetSettings     = new Subject<any>();
    formGetExport       = new Subject<any>();
    formGetPermission   = new Subject<any>();
    formGetView         = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient,
                private lobService: LOBService) { }

    httpPostCreateForm(data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/form',
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
                this.formPost.next(response);
            },
            (response: any) => {          
                this.formPost.next(response.error);
            }
        );
    }

    httpPostRestoreForm(id: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/form/restore',
            {id: id}
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
                this.formPostRestore.next(response);
            },
            (response: any) => {          
                this.formPostRestore.next(response.error);
            }
        );    
    }

    httpPutForm(id: any, data: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/form/' + id,
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
                this.formPut.next(response);
            },
            (response: any) => {
                this.formPut.next(response.error);
            }
        );
    }


    httpGetAllDeletedForm(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/deleted',
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
                this.formGetAllDeleted.next(response);
            },
            (response: any) => {
                this.formGetAllDeleted.next(response.error);
            }
        );
    }

    httpGetFormById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id
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
                this.formGet.next(response);
            },
            (response: any) => {
                this.formGet.next(response.error);
            }
        );
    }

    httpGetFormByHash(hash: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/public/form/' + hash
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
                this.formGet.next(response);
            },
            (response: any) => {
                this.formGet.next(response.error);
            }
        );
    }

    httpGetFormSettingsById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id + '/settings_page'
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
                this.formGetSettings.next(response);
            },
            (response: any) => {
                this.formGetSettings.next(response.error);
            }
        );
    }

    httpGetFormViewById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id + '/view_page'
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
                this.formGetView.next(response);
            },
            (response: any) => {
                this.formGetView.next(response.error);
            }
        );
    }

    httpGetFormExportById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id + '/export_page'
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
                this.formGetExport.next(response);
            },
            (response: any) => {
                this.formGetExport.next(response.error);
            }
        );
    }

    httpGetFormPermissionById(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id + '/permission_page'
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
                this.formGetPermission.next(response);
            },
            (response: any) => {
                this.formGetPermission.next(response.error);
            }
        );
    }

    httpGetFormByTableName(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id
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
                this.formGetTableName.next(response);
            },
            (response: any) => {
                this.formGetTableName.next(response.error);
            }
        );
    }

    httpGetFormByIdAcl(id: any) {

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/form/' + id + '/acl'
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
                // this.parseFormPermissions(response['acl']);
                this.formGetAcl.next(response);
            },
            (response: any) => {
                this.formGetAcl.next(response.error);
            }
        );
    }

    parseFormPermissions(perms: any) {
        var permissions: any = {};

        for (let key in perms) {
           var name = key.charAt(0).toUpperCase() + key.slice(1);
           permissions[name + 'Edit']    = (perms[key].indexOf('PUT') !== -1)       ? true : false;
           permissions[name + 'View']    = (perms[key].indexOf('GET') !== -1)       ? true : false;
           permissions[name + 'Add']     = (perms[key].indexOf('POST') !== -1)      ? true : false;
           permissions[name + 'Delete']  = (perms[key].indexOf('DELETE') !== -1)    ? true : false;

           if (name == 'Default') {
               permissions[name + 'EditOwn'] = (perms[key].indexOf('PUT_OWN') !== -1) ? true : false;
               permissions[name + 'AddRecord'] = (perms[key].indexOf('NO_ADD') !== -1) ? false : true;
           }
       }
       this.formAcl = permissions;
       this.formGetPermissions.next(permissions);
    }

    httpDeleteForm(id: any) {

        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/form/' + id
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
                this.formDelete.next(response);
            },
            (response: any) => {
                this.formDelete.next(response.error);
            }
        );
    }
}
 
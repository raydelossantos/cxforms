import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';
import { APP_CONFIG } from '../app.config';
import 'rxjs/Rx';

@Injectable()
export class LOBService {
    lobGet              = new Subject<any>();
    lobGetAll           = new Subject<any>();
    lobPost             = new Subject<any>();
    lobPut              = new Subject<any>();
    lobDelete           = new Subject<any>();
    lobGetAllDeleted    = new Subject<any>();
    lobPostRestore      = new Subject<any>();
    lobUserGet          = new Subject<any>();

    constructor(@Inject(APP_CONFIG) private appConfig,
                private httpClient: HttpClient) { }

    httpGetAllLOB(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/lob',
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
                this.lobGetAll.next(response);
            },
            (response: any) => {
                this.lobGetAll.next(response.error);
            }
        );
    }

    httpGetAllDeletedLOB(params: any = []) {

        let httpParams = new HttpParams();

        for (const param of Object.keys(params)) {
            httpParams = httpParams.append(param, params[param]);
        }

        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/lob/deleted',
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
                this.lobGetAllDeleted.next(response);
            },
            (response: any) => {
                this.lobGetAllDeleted.next(response.error);
            }
        );
    }

    httpPostLOB(data: any) {
        const req = new HttpRequest(
            'POST',
            this.appConfig.API_ENDPOINT + '/lob',
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
                this.lobPost.next(response);
            },
            (response: any) => {
                this.lobPost.next(response.error);
            }
        );
    }

    httpPutLOB(id: number, data: any) {
        const req = new HttpRequest(
            'PUT',
            this.appConfig.API_ENDPOINT + '/lob/' + id,
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
                this.lobPut.next(response);
            },
            (response: any) => {
                this.lobPut.next(response.error);
            }
        );
    }

    httpDeleteLOB(id: number) {
        const req = new HttpRequest(
            'DELETE',
            this.appConfig.API_ENDPOINT + '/lob/' + id
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
                this.lobDelete.next(response);
            },
            (response: any) => {
                this.lobDelete.next(response.error);
            }
        );
    }

    httpGetLOBById(id: number) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/lob/' + id
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
                this.lobGet.next(response);
            },
            (response: any) => {
                this.lobGet.next(response.error);
            }
        );
    }

    httpGetLOBUserByClientId(id: number) {
        const req = new HttpRequest(
            'GET',
            this.appConfig.API_ENDPOINT + '/lob/' + id + '/user'
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
                this.lobUserGet.next(response);
            },
            (response: any) => {
                this.lobUserGet.next(response.error);
            }
        );
    }

    httpPostRestoreLOB(id: any) {
        const req = new HttpRequest(
          'POST',
          this.appConfig.API_ENDPOINT + '/lob/restore',
          {id: id}
        );
    
        return this.httpClient.request(req)
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
            this.lobPostRestore.next(response);
          },
          (response: any) => {
            this.lobPostRestore.next(response.error);
          }
        );
        
      }

}
 
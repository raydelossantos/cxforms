import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class ClientService {

  clientGetAll          = new Subject<any>();
  clientGet             = new Subject<any>();
  clientGetFull         = new Subject<any>();
  clientPost            = new Subject<any>();
  clientDelete          = new Subject<any>();
  clientPut             = new Subject<any>();
  clientGetAllDeleted   = new Subject<any>();
  clientPostRestore     = new Subject<any>();

  /** Client Admin Management Routes/Services */
  clientAdminPost       = new Subject<any>();
  clientAdminDelete     = new Subject<any>();
  clientAdminGet        = new Subject<any>();
  clientAdminBatchPut   = new Subject<any>();

  /** Lob Users Management Routes/Services */
  lobUserPost           = new Subject<any>();
  lobUserGet            = new Subject<any>();
  lobUserDelete         = new Subject<any>();
  lobUserBatchPut       = new Subject<any>();

  constructor(
    @Inject(APP_CONFIG) private appConfig,
            private httpClient: HttpClient,
            public authService: AuthService) { }

  httpGetAllClient(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/client',
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
        this.clientGetAll.next(response);
      },
      (response: any) => {
        this.clientGetAll.next(response.error);
      }
    );
  }

  httpGetClient(client_id: number) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/client/' + client_id
    );

    return this.httpClient.request(req)
    .map(
      (response: any) => {
        if (typeof(response) !== 'undefined' && response.body != null) {
          return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.clientGet.next(response);
      },
      (response: any) => {
        this.clientGet.next(response.error);
      }
    );

  }

  httpGetClientFull(client_id: number) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/client/' + client_id + '/full'
    );

    return this.httpClient.request(req)
    .map(
      (response: any) => {
        if (typeof(response) !== 'undefined' && response.body != null) {
          return response.body;
        }

        return [];
      }
    )
    .subscribe(
      (response: any) => {
        this.clientGetFull.next(response);
      },
      (response: any) => {
        this.clientGetFull.next(response.error);
      }
    );

  }

  httpPostClient(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/client',
      data
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
        this.clientPost.next(response);
      },
      (response: any) => {
        this.clientPost.next(response.error);
      }
    );
    
  }

  httpPostRestoreClient(id: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/client/restore',
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
        this.clientPostRestore.next(response);
      },
      (response: any) => {
        this.clientPostRestore.next(response.error);
      }
    );
    
  }

  httpPutClient(id: any, data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/client/' + id,
      data
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
        this.clientPut.next(response);
      },
      (response: any) => {
        this.clientPut.next(response.error);
      }
    );
    
  }

  httpDeleteClient(id: any) {

    const req = new HttpRequest(
        'DELETE',
        this.appConfig.API_ENDPOINT + '/client/' + id
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
            this.clientDelete.next(response);
        },
        (response: any) => {
            this.clientDelete.next(response.error);
        }
    );
  }

  httpGetAllDeletedClient() {

    const req = new HttpRequest(
        'GET',
        this.appConfig.API_ENDPOINT + '/client/deleted'
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
            this.clientGetAllDeleted.next(response);
        },
        (response: any) => {
            this.clientGetAllDeleted.next(response.error);
        }
    );
  }

  /** CLIENT ADMIN MANAGEMENT */

  httpPostClientAdmin(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/client/admin',
      data
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
        this.clientAdminPost.next(response);
      },
      (response: any) => {
        this.clientAdminPost.next(response.error);
      }
    );
    
  }

  httpGetClientAdmin(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/client/admin',
      {
        params: httpParams
      }
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
        this.clientAdminGet.next(response);
      },
      (response: any) => {
        this.clientAdminGet.next(response.error);
      }
    );
    
  }

  httpPutClientAdminBatch(data: any, client_id: any) {
    const req = new HttpRequest(
        'PUT',
        this.appConfig.API_ENDPOINT + '/client/admin/batch/' + client_id,
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
            this.clientAdminBatchPut.next(response);
        },
        (response: any) => {
            this.clientAdminBatchPut.next(response.error);
        }
    );
  }

  httpDeleteClientAdmin(id: any) {

      const req = new HttpRequest(
        'DELETE',
        this.appConfig.API_ENDPOINT + '/client/admin/' + id
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
            this.clientAdminDelete.next(response);
        },
        (response: any) => {
            this.clientAdminDelete.next(response.error);
        }
    );
  }

  /** LOB USERS MAINTENANCE */
  
  httpGetLobUser(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/client/lob_user',
      {
        params: httpParams
      }
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
        this.lobUserGet.next(response);
      },
      (response: any) => {
        this.lobUserGet.next(response.error);
      }
    );
    
  }

  httpPostLobUser(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/client/lob_user',
      data
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
        this.lobUserPost.next(response);
      },
      (response: any) => {
        this.lobUserPost.next(response.error);
      }
    );
    
  }

  httpDeleteLobUser(id: any) {

      const req = new HttpRequest(
        'DELETE',
        this.appConfig.API_ENDPOINT + '/client/lob_user/' + id
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
            this.lobUserDelete.next(response);
        },
        (response: any) => {
            this.lobUserDelete.next(response.error);
        }
    );
  }

  httpPutLobUserBatch(data: any, lob_id: any) {
    const req = new HttpRequest(
        'PUT',
        this.appConfig.API_ENDPOINT + '/client/lob/batch/' + lob_id,
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
            this.lobUserBatchPut.next(response);
        },
        (response: any) => {
            this.lobUserBatchPut.next(response.error);
        }
    );
  }

}

import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class MemberService {

  memberGetAll          = new Subject<any>();
  memberGetAllUsers     = new Subject<any>();
  memberGet             = new Subject<any>();
  memberPost            = new Subject<any>();
  memberDelete          = new Subject<any>();
  memberGetAllDeleted   = new Subject<any>();
  memberPut             = new Subject<any>();

  constructor(
    @Inject(APP_CONFIG) private appConfig,
            private httpClient: HttpClient,
            public authService: AuthService) { }

  httpGetAllMembers(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/member',
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
        this.memberGetAll.next(response);
      },
      (response: any) => {
        this.memberGetAll.next(response.error);
      }
    );
  }

  httpGetAllMembersPublic(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/public/member',
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
        this.memberGetAll.next(response);
      },
      (response: any) => {
        this.memberGetAll.next(response.error);
      }
    );
  }

  httpGetAllMembersNotInTeam(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/member/users',
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
        this.memberGetAllUsers.next(response);
      },
      (response: any) => {
        this.memberGetAllUsers.next(response.error);
      }
    );
  }

  httpGetAllDeletedMembers(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/member/deleted',
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
        this.memberGetAllDeleted.next(response);
      },
      (response: any) => {
        this.memberGetAllDeleted.next(response.error);
      }
    );
  }
  
  httpGetMemberById(member_id: number) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/member/' + member_id
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
        this.memberGet.next(response);
      },
      (response: any) => {
        this.memberGet.next(response.error);
      }
    );

  }

  httpPostMember(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/member',
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
        this.memberPost.next(response);
      },
      (response: any) => {
        this.memberPost.next(response.error);
      }
    );
    
  }

  httpPutMember(id: any, data: any) {
    const req = new HttpRequest(
      'PUT',
      this.appConfig.API_ENDPOINT + '/member/' + id,
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
        this.memberPut.next(response);
      },
      (response: any) => {
        this.memberPut.next(response.error);
      }
    );
    
  }

  httpDeleteMember(id: any) {
    const req = new HttpRequest(
      'DELETE',
      this.appConfig.API_ENDPOINT + '/member/' + id
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
        this.memberDelete.next(response);
      },
      (response: any) => {
        this.memberDelete.next(response.error);
      }
    );
    
  }
  
}

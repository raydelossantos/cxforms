import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpRequest, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs/Subject';

import 'rxjs/Rx';

import { APP_CONFIG } from '../app.config';
import { AuthService } from './auth.service';

@Injectable()
export class TeamService {

  teamGetAll          = new Subject<any>();
  teamGet             = new Subject<any>();
  teamPost            = new Subject<any>();
  teamDelete          = new Subject<any>();
  teamGetAllDeleted   = new Subject<any>();
  teamPut             = new Subject<any>();
  teamPostRestore     = new Subject<any>();
  teamGetAllNotInForm = new Subject<any>();
  teamGetAllByUserId  = new Subject<any>();

  constructor(
    @Inject(APP_CONFIG) private appConfig,
            private httpClient: HttpClient,
            public authService: AuthService) { }

  httpGetAllTeams(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/team',
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
        this.teamGetAll.next(response);
      },
      (response: any) => {
        this.teamGetAll.next(response.error);
      }
    );
  }

  httpGetAllTeamsNotInForm(form_id: any) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/team/form/' + form_id
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
        this.teamGetAllNotInForm.next(response);
      },
      (response: any) => {
        this.teamGetAllNotInForm.next(response.error);
      }
    );
  }

  httpGetAllDeletedTeams(params: any = []) {

    let httpParams = new HttpParams();

    for (const param of Object.keys(params)) {
      httpParams = httpParams.append(param, params[param]);
    }

    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/team/deleted',
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
        this.teamGetAllDeleted.next(response);
      },
      (response: any) => {
        this.teamGetAllDeleted.next(response.error);
      }
    );
  }

  httpGetAllTeamsByUserId(user_id: number) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/team/user/' + user_id
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
        this.teamGetAllByUserId.next(response);
      },
      (response: any) => {
        this.teamGetAllByUserId.next(response.error);
      }
    );

  }

  httpGetTeamById(team_id: number) {
    const req = new HttpRequest(
      'GET',
      this.appConfig.API_ENDPOINT + '/team/' + team_id
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
        this.teamGet.next(response);
      },
      (response: any) => {
        this.teamGet.next(response.error);
      }
    );
  }

  httpPostTeamRestore(team_id: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/team/restore',
      {id: team_id}
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
        this.teamPostRestore.next(response);
      },
      (response: any) => {
        this.teamPostRestore.next(response.error);
      }
    );
  }

  httpPostTeam(data: any) {
    const req = new HttpRequest(
      'POST',
      this.appConfig.API_ENDPOINT + '/team',
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
        this.teamPost.next(response);
      },
      (response: any) => {
        this.teamPost.next(response.error);
      }
    );
    
  }

  httpPutTeam(id: any, data: any) {
    const req = new HttpRequest(
      'PUT',
      this.appConfig.API_ENDPOINT + '/team/' + id,
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
        this.teamPut.next(response);
      },
      (response: any) => {
        this.teamPut.next(response.error);
      }
    );
    
  }

  httpDeleteTeam(id: any) {
    const req = new HttpRequest(
      'DELETE',
      this.appConfig.API_ENDPOINT + '/team/' + id
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
        this.teamDelete.next(response);
      },
      (response: any) => {
        this.teamDelete.next(response.error);
      }
    );
    
  }
  
}

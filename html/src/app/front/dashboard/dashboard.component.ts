import { Component, OnInit, OnDestroy, Inject, AfterViewInit } from '@angular/core';
import { GlobalService } from '../../services/global.service';
import { Subscription } from 'rxjs';
import { APP_CONFIG } from '../../app.config';
import { ClientService } from '../../services/client.service';
import { LOBService } from '../../services/lob.service';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service.1';
import { trigger, transition, style, animate } from '@angular/animations';

import swal from 'sweetalert2';
import { ActivatedRoute, Router, Params } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [   // :enter is alias to 'void => *'
          style({opacity:0}),
          animate(1000, style({opacity:1})) 
        ]),
        transition(':leave', [   // :leave is alias to '* => void'
          animate(1000, style({opacity:0})) 
        ])
      ])
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  _api_endpoint : string    = '';
  app_version   : string    = '0.0.1';
  clientShow    : boolean = false;
  clientStorageSubscription: Subscription;
  client        : any;

  constructor(private clientService: ClientService,
              private globalService: GlobalService,
              private titleService: Title,
              private authService: AuthService,
              private commonService: CommonService,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Home Dashboard');
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    this.app_version   = this.appConfig.APP_VERSION;

    let _client = this.globalService.getClientCookie();
  
    if (_client) {
      this.client = _client;
      this.clientShow = true;
    }

    this.clientStorageSubscription = this.globalService.clientChange.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined') {
          this.client = client;
          this.clientShow = true;
        }
      }
    );
     
  }

  onClientChange(client: any) {
    this.globalService.setClientCookie(client);
  }

   ngOnDestroy(): void {
    if (this.clientStorageSubscription) this.clientStorageSubscription.unsubscribe();
  }

  ngAfterViewInit() {
  }

}

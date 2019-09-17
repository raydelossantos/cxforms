import { Component, OnInit, Inject, OnDestroy, AfterViewInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClientService } from '../../services/client.service';
import { APP_CONFIG } from '../../app.config';
import { Title } from '@angular/platform-browser';
import { CommonService } from '../../services/common.service.1';
import { GlobalService } from '../../services/global.service';
import { Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-admin-dashboard',
  animations: [
    trigger(
      'enterAnimation', [
        transition(':enter', [   // :enter is alias to 'void => *'
          style({opacity:0}),
          animate(500, style({opacity:1})) 
        ]),
        transition(':leave', [   // :leave is alias to '* => void'
          animate(500, style({opacity:0})) 
        ])
      ])
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  public loading = false;
  public loading_clients = false;

  clients: any = [];
  clientGetAllSubscription: Subscription;
  commonGetAllStatsSubscription: Subscription;
  searchText: string = '';

  no_record_message: string = 'No records found.';

  _quick_overviews = [];

  _api_endpoint: any;

  constructor(private clientService: ClientService,
              @Inject(APP_CONFIG) private appConfig,
              private titleService: Title,
              private router: Router,
              private globalService: GlobalService,
              private commonService: CommonService) { }

  ngOnInit() {
    // set page title
    this.titleService.setTitle('Connext Forms - Admin Dashboard');

    this.loading = true;
    this.loading_clients = true;
    this._api_endpoint = this.appConfig.API_ENDPOINT;

    this.clientService.httpGetAllClient();
    this.clientGetAllSubscription = this.clientService.clientGetAll.subscribe(
      (clients: any) => {
        if ( typeof(clients) !== 'undefined' && clients.success) {
          this.clients = clients.data.sort(
            function (a, b) {
              return a.client_name - b.client_name;
            }
          );
          this.loading_clients = false;
        } else if ( typeof(clients) !== 'undefined' && clients.success === false) {
          this.loading_clients = false;
          this.no_record_message = 'No records found. ' + clients.message;
        }
      }
    );

    this.commonService.httpGetAllStats();
    this.commonGetAllStatsSubscription = this.commonService.statsGetAll.subscribe(
      (stats: any) => {
        if (typeof(stats) !== 'undefined' && stats.success) {
          this._quick_overviews = [
            { 
              name: 'Users', 
              link: 'user/list', 
              count: stats.data.user_active, 
              description: 'User accounts', 
              icon: 'fa-users',
              others: [
                { title: 'Disabled Accounts', count: stats.data.user_inactive, icon: 'fa-ban', link: 'user/disabled'},
                { title: 'Blocked Accounts', count: stats.data.user_blocked, icon: 'fa-lock', link: 'user/blocked'},
              ]
            },{ 
              name: 'System Admins', 
              link: 'sysadmin/list', 
              count: stats.data.user_admin, 
              description: 'Privileged Users', 
              icon: 'fa-user-secret',
              others: []
            },{ 
              name: 'Clients', 
              link: 'client/list', 
              count: stats.data.client_active, 
              description: 'Monitored Clients', 
              icon: 'fa-newspaper-o',
              others: [
                { title: 'Archived Clients', count: stats.data.client_inactive, icon: 'fa-archive', link: 'client/archived'},
                { title: 'Lines of Businesses', count: stats.data.lob_active, icon: 'fa-building', link: 'client/business'},
              ]
            },{ 
              name: 'Teams', 
              link: 'team/list', 
              count: stats.data.team_active, 
              description: 'Roles & Members', 
              icon: 'fa-sitemap',
              others: [
                { title: 'Archived Teams', count: stats.data.team_inactive, icon: 'fa-archive', link: 'team/archived'},
              ]
            },
          ];

          this.loading = false;
        } else if (typeof(stats) !== 'undefined' && stats.success) {
          this.loading = false;
        }
      }
    )

  }

  onClientChange(client: any) {
    this.globalService.setClientCookie(client);
    this.router.navigate(['/home/' + client.id])
  }

  ngOnDestroy() {
    if (this.clientGetAllSubscription) this.clientGetAllSubscription.unsubscribe();
    if (this.commonGetAllStatsSubscription) this.commonGetAllStatsSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    const that = this; 

    $('#searchText').keyup(function(e) {
      if (e.keyCode == 27) {
        $('#searchText').val('');
        that.searchText = '';
      }
    });

  }
}

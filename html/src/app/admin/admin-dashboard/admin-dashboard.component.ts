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

  _quick_overview = [];

  _user_overview = [];
  _client_overview = [];
  _team_overview = [];


  _api_endpoint: any;
  _teams_overview: { name: string; link: string; count: any; description: string; icon: string; color: string; others: any[]; }[];

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
          this._quick_overview = [
            { 
              name: 'Users', 
              link: 'user/list', 
              count: stats.data.user_active, 
              description: 'User accounts', 
              icon: 'fa-users',
              color: 'green'
            },{ 
              name: 'System Admins', 
              link: 'sysadmin/list', 
              count: stats.data.user_admin, 
              description: 'Privileged Users', 
              icon: 'fa-user-secret',
              color: 'red'
            },{ 
              name: 'Clients', 
              link: 'client/list', 
              count: stats.data.client_active, 
              description: 'Active clients', 
              icon: 'fa-newspaper-o',
              color: 'blue'
            },{ 
              name: 'Teams', 
              link: 'team/list', 
              count: stats.data.team_active, 
              description: 'Roles & Members', 
              icon: 'fa-pie-chart',
              color: 'purple'
            }
          ];

          this._user_overview = [
            { 
              name: 'Users', 
              link: 'user/list', 
              count: stats.data.user_active, 
              description: 'User accounts', 
              icon: 'fa-users',
              color: 'green',
              others: [
                { title: 'Sync Accounts', count: 0, icon: 'fa-refresh', link: 'user/sync' }
              ]
            },{ 
              name: 'System Admins', 
              link: 'sysadmin/list', 
              count: stats.data.user_admin, 
              description: 'Privileged Users', 
              icon: 'fa-user-secret',
              color: 'red',
              others: []
            },{ 
              name: 'Blocked Accounts', 
              link: 'user/blocked', 
              count: stats.data.user_blocked, 
              description: 'Invalid Logins', 
              icon: 'fa-lock',
              color: 'yellow',
              others: [
              ]
            },{ 
              name: 'Disabled Accounts', 
              link: 'user/disabled', 
              count: stats.data.user_inactive, 
              description: 'Restricted Access', 
              icon: 'fa-ban',
              color: 'grey',
              others: [
              ]
            }
          ];

          this._client_overview = [
            { 
              name: 'Clients', 
              link: 'client/list', 
              count: stats.data.client_active, 
              description: 'Existing customers', 
              icon: 'fa-newspaper-o',
              color: 'teal',
              others: []
            },{ 
              name: 'Archived Clients', 
              link: 'client/archived', 
              count: stats.data.client_inactive, 
              description: 'Inactive customers', 
              icon: 'fa-newspaper-o',
              color: 'grey',
              others: []
            },{ 
              name: 'Lines of Businesses', 
              link: 'client/business', 
              count: stats.data.team_active, 
              description: 'Clients\' subject focus', 
              icon: 'fa-building',
              color: 'green',
              others: []
            },{ 
              name: 'Archived LOB\'s', 
              link: 'client/archivedlob', 
              count: stats.data.team_inactive, 
              description: 'Inactive LOB\'s', 
              icon: 'fa-building',
              color: 'grey',
              others: []
            },           
          ];

          this._team_overview = [
            { 
              name: 'Teams', 
              link: 'team/list', 
              count: stats.data.team_active, 
              description: 'Roles & Members', 
              icon: 'fa-sitemap',
              color: 'purple',
              others: []
            },{ 
              name: 'Archived Teams', 
              link: 'team/list', 
              count: stats.data.team_inactive, 
              description: 'Disregarded teams', 
              icon: 'fa-archive',
              color: 'grey',
              others: []
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

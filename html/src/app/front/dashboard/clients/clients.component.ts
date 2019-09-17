import { Component, OnInit, Inject } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';
import { LOBService } from '../../../services/lob.service';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service.1';
import { APP_CONFIG } from '../../../app.config';
import { Subscription } from 'rxjs/Subscription';
import swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-clients',
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
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss']
})
export class ClientsComponent implements OnInit {

  public loading = false;
  public loading2 = false;
  public loading3 = false;
  _api_endpoint: string = '';

  clientsVisibile: boolean = false;

  clientShow: boolean = false;
  is_admin: boolean = false;

  searchText: any = '';
  searchTextForm: any = '';

  no_record_message: string = 'No clients found.';

  client: any;
  clients: any = [];

  forms: any = [];

  clientGetAllSubscription: Subscription;
  clientStorageSubscription: Subscription;
  userFormGetSubscription: Subscription;

  constructor(private clientService: ClientService,
    private route: ActivatedRoute,
    private router: Router,
    private globalService: GlobalService,
    private lobService: LOBService,
    private titleService: Title,
    private authService: AuthService,
    private commonService: CommonService,
    @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {
    this.is_admin = this.authService.auth.user.user.is_admin;

    this.commonService.httpGetUserClients();

    this.loading = true;
    this.loading3 = true;
    
    let _client = this.globalService.getClientCookie();
    this._api_endpoint = this.appConfig.API_ENDPOINT;

    if (typeof(_client) !== 'undefined' && _client !== null) {
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

    this.clientGetAllSubscription = this.commonService.userClientGet.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this.clients = clients.data.sort(
            function (a, b) {
              return a.client_name - b.client_name;
            }
          );
          this.loading = false;
          this.loading3 = false;
        } else if (typeof(clients) !== 'undefined' && clients.success === false) {
          this.loading = false;
          this.no_record_message = 'No records found. ' + clients.message;
        }
        this.loading = false;
      } 
    );

  } 
    
  // {

  //     if (this.forms.length === 0) {
  //       this.commonService.httpGetUserForms();
  //       this.loading2 = true;
  //     }
  
  //     this.userFormGetSubscription = this.commonService.userFormGet.subscribe(
  //       (forms: any) => {
  //         if (typeof(forms) !== 'undefined' && forms.success) {
  //           this.forms = forms.data;
  //           // this.forms = Object.values(forms.data);
  //           this.loading2 = false;
  //           this.loading3 = false;
  //         } else if (typeof(forms) !== 'undefined' && forms.success === false) {
  //           swal('Error', 'Unable to fetch form information. <br><br>' + forms.message, 'error');
  //         }
  //       }
  //     );

  //   }
    
  // }

  onRefreshClients() {
    this.loading3 = true;
    this.commonService.httpGetUserClients();
  }

  onRefreshForms() {
    this.commonService.httpGetUserClients();
    this.loading2 = true;
  }

  onClientChange(client: any) {
    this.globalService.setClientCookie(client);
    this.clientsVisibile = false;
  }

}

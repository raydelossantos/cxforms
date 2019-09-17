import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { ClientService } from '../../../services/client.service';
import { ActivatedRoute, Router } from '@angular/router';
import { GlobalService } from '../../../services/global.service';
import { LOBService } from '../../../services/lob.service';
import { Title } from '@angular/platform-browser';
import { AuthService } from '../../../services/auth.service';
import { CommonService } from '../../../services/common.service.1';
import { APP_CONFIG } from '../../../app.config';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forms',
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
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss']
})
export class FormsComponent implements OnInit, OnDestroy {

  public loading = false;
  public loading2 = false;
  _api_endpoint: string = '';

  clientsVisibile: boolean = false;

  clientShow: boolean = false;
  is_admin: boolean = false;

  searchText: any = '';
  searchTextForm: any = '';

  no_record_message: string = 'No records found.';

  client: any;
  clients: any = [];

  forms: any = [];

  clientGetSubscription: Subscription;
  clientStorageSubscription: Subscription;
  userFormGetSubscription: Subscription;
  selectedClient: any;
  lobGetAllSubscription: Subscription;
  lobs: any = [];

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

    // if (this.is_admin)  {

      this.loading2 = true;
      // this.clientService.httpGetAllClient();
  
      let _client = this.globalService.getClientCookie();
      this.client = _client;
      this._api_endpoint = this.appConfig.API_ENDPOINT;
  
      const _url = this.router.url.split("/");
      const _client_id = _url[2];

      if (_client.id == _client_id) {
        this.selectedClient = _client;
        // this.lobService.httpGetAllLOB({'client_id': _client.id});
      // } else {
        this.commonService.httpGetUserForms(parseInt(_client_id));
      }

      // this.lobGetAllSubscription = this.lobService.lobGetAll.subscribe(
      //   (lobs: any) => {
      //     if (typeof(lobs) !== 'undefined' && lobs.success){
      //       this.lobs = lobs.data;

      //       // get all forms in every LOBs
      //       var forms: any = [];

      //       lobs.data.forEach(lob => {

      //         lob.forms.forEach(form => {
      //           form.client_name = lob.client.client_name;
      //           form.client_id = lob.client.id;
      //           form.lob_name = lob.lob_name;
      //           forms.push(form);
      //         });
              
      //       });

      //       this.forms = forms;
      //       this.loading = false;
      //       this.loading2 = false;
      //     }
      //   }
      // );
      
      this.lobGetAllSubscription = this.commonService.userFormGet.subscribe(
        (lobs: any) => {
          if (typeof(lobs) !== 'undefined' && lobs.success){
            this.lobs = lobs.data;

            // get all forms in every LOBs
            var forms: any = [];

            lobs.data.forEach(lob => {

              lob.forms.forEach(form => {
                form.client_name = lob.client.client_name;
                form.client_id = lob.client.id;
                form.lob_name = lob.lob_name;
                forms.push(form);
              });
              
            });

            this.forms = forms;
            this.loading = false;
            this.loading2 = false;
          }
        }
      );

      if (typeof(_client) !== 'undefined' && _client !== null) {
        this.client = _client;
        this.clientShow = true;
      }
  
      this.clientStorageSubscription = this.globalService.clientChange.subscribe(
        (client: any) => {
          if (typeof(client) !== 'undefined') {
            this.client = client;
            this.clientShow = true;

            this.commonService.httpGetUserForms(parseInt(_client_id));
            // this.lobService.httpGetAllLOB({'client_id': client.id});  
          }
        }
      );
  
      this.clientGetSubscription = this.clientService.clientGet.subscribe(
        (client: any) => {
          if (typeof(client) !== 'undefined' && client.success) {
            
            this.client = client.data;

            this.globalService.setClientCookie(client.data);

            // this.lobService.httpGetAllLOB({'client_id': client.data.id});  
            this.commonService.httpGetUserForms(parseInt(_client_id));

          } else if (typeof(client) !== 'undefined' && client.success === false) {
            this.loading = false;
            this.no_record_message = 'No records found. ' + client.message;
          }
          this.loading = false;
        }
      );

    // } 
    // else {

    //   if (this.forms.length === 0) {
    //     this.commonService.httpGetUserForms(this.client.id);
    //     this.loading = true;
    //     this.loading2 = true;
    //   }
  
    //   this.userFormGetSubscription = this.commonService.userFormGet.subscribe(
    //     (forms: any) => {
    //       if (typeof(forms) !== 'undefined' && forms.success) {
    //         this.forms = forms.data;
    //         // this.forms = Object.values(forms.data);
    //         this.loading = false;
    //         this.loading2 = false;
    //       } else if (typeof(forms) !== 'undefined' && forms.success === false) {
    //         swal('Error', 'Unable to fetch form information. <br><br>' + forms.message, 'error');
    //       }
    //     }
    //   );

    // }
  }

  onRefreshForms() {
    this.loading = true;
    this.loading2 = true;
    // this.lobService.httpGetAllLOB({'client_id': this.client.id}); 
    this.commonService.httpGetUserForms(parseInt(this.client.id));
  }


  ngOnDestroy(): void {
    if (this.clientGetSubscription) this.clientGetSubscription.unsubscribe();
    if (this.clientStorageSubscription) this.clientStorageSubscription.unsubscribe();
    if (this.userFormGetSubscription) this.userFormGetSubscription.unsubscribe();
    if (this.lobGetAllSubscription) this.lobGetAllSubscription.unsubscribe();
  }

}

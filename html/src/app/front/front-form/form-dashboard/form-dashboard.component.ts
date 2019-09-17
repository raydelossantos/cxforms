import { Component, OnInit, OnDestroy, Inject} from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { FormService } from '../../../services/form.service';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { GlobalService } from '../../../services/global.service';
import { AuthService } from '../../../services/auth.service';
import { APP_CONFIG } from '../../../app.config';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-form-dashboard',
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
  templateUrl: './form-dashboard.component.html',
  styleUrls: ['./form-dashboard.component.scss']
})
export class FormDashboardComponent implements OnInit, OnDestroy {
  
  public loading = false;
  newForm: boolean = true;
  form_id: any;
  form:     any = null;

  app_version = '0.0.1';

  formGetAclSubscription: Subscription;
  formPermissionsSubscription: Subscription;

  formPermissions: any = {
                      AdminAdd            : false,
                      AdminDelete         : false,
                      AdminEdit           : false,
                      AdminView           : false,
                      ClientAdd           : false,
                      ClientDelete        : false,
                      ClientEdit          : false,
                      ClientView          : false,
                      CommonAdd           : false,
                      CommonDelete        : false,
                      CommonEdit          : false,
                      CommonView          : false,
                      DefaultAddRecord    : false,
                      DefaultAdd          : false,
                      DefaultDelete       : false,
                      DefaultEdit         : false,
                      DefaultView         : false,
                      ExportAdd           : false,
                      ExportDelete        : false,
                      ExportEdit          : false,
                      ExportView          : false,
                      FieldAdd            : false,
                      FieldDelete         : false,
                      FieldEdit           : false,
                      FieldView           : false,
                      FormAdd             : false,
                      FormDelete          : false,
                      FormEdit            : false,
                      FormView            : false,
                      LobAdd              : false,
                      LobDelete           : false,
                      LobEdit             : false,
                      LobView             : false,
                      MemberAdd           : false,
                      MemberDelete        : false,
                      MemberEdit          : false,
                      MemberView          : false,
                      PermissionAdd       : false,
                      PermissionDelete    : false,
                      PermissionEdit      : false,
                      PermissionView      : false,
                      PrivilegeAdd        : false,
                      PrivilegeDelete     : false,
                      PrivilegeEdit       : false,
                      PrivilegeView       : false,
                      TeamAdd             : false,
                      TeamDelete          : false,
                      TeamEdit            : false,
                      TeamView            : false,
                      UserAdd             : false,
                      UserDelete          : false,
                      UserEdit            : false,
                      UserView            : false
                  };
  _api_endpoint: any;
  client: any = null;

  constructor(@Inject (APP_CONFIG) private appConfig,
              private route:              ActivatedRoute,
              private formService:        FormService,
              private authService:        AuthService,
              private globalService:      GlobalService,
              private router:             Router) { }

  ngOnInit() {
    this.app_version = this.appConfig.APP_VERSION;
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    let _client = this.globalService.getClientCookie();
    
    this.route.params.subscribe(
      (params: Params) => {
        this.loading = true;

        this.form_id = +params['id'];

        if (params['id'] == 'new') {
          this.newForm = true;
          this.loading = false;
        } else {
          this.newForm = false;
          this.formService.httpGetFormByIdAcl(this.form_id);

          this.formGetAclSubscription = this.formService.formGetAcl.subscribe(
            (form: any) => {
              if (typeof(form) !== 'undefined' && form.success) {
                this.form = form.data;
                this.formService.parseFormPermissions(form.acl);

                const is_admin = this.authService.auth.user.user.is_admin;
                if (is_admin) {
                  // if form is loaded, try to check client cookie if set
                  // set if not set,,mload sidebar lobs & forms if user is admin
                  const client_cookie = this.globalService.getClientCookie();

                  if (!client_cookie) {
                    const client = form.data.lob.client;
                    this.globalService.setClientCookie(client);
                  }
                }

                if (_client) {
                  if (_client.id == form.data.lob.client.id) {
                    this.client = _client;
                  } else {
                    this.client = form.data.lob.client;
                  }                  
                }

                this.loading = false;

              } else if (typeof(form) !== 'undefined' && form.success === false) {
                swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')
                this.router.navigate(['/home']);
                this.loading = false;
              }
            }
          );

          this.formPermissionsSubscription = this.formService.formGetPermissions.subscribe(
            (permissions: any) => {
              if (typeof(permissions) !== 'undefined') {
                this.formPermissions = permissions;
              } else if (typeof(permissions) !== 'undefined') {
                swal('Error', 'Unable to fetch form permissions. Please try again. <br><br> You were redirected to homepage.', 'error');
                this.router.navigate(['/home']);
              }
            }
          );
        }
      }

    );

  }

  onRefreshForm() {
    this.loading = true;
    this.formService.httpGetFormByIdAcl(this.form_id);
  }

  ngOnDestroy() {
    if (this.formGetAclSubscription) this.formGetAclSubscription.unsubscribe();
    if (this.formPermissionsSubscription) this.formPermissionsSubscription.unsubscribe();
  }
}

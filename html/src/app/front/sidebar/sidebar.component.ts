import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ClientService } from '../../services/client.service';
import { FormService } from '../../services/form.service';
import { Subscription } from 'rxjs/Subscription';
import { LOBService } from '../../services/lob.service';
import { GlobalService } from '../../services/global.service';

import swal from 'sweetalert2';

import { Form } from '../../models/form.model';
import { APP_CONFIG } from '../../app.config';
import { AuthService } from '../../services/auth.service';
import { CommonService } from '../../services/common.service.1';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy {

  public loading = false;

  active_class: any;
  selectedClient: any;

  _api_endpoint: string = '';
  is_admin: boolean = false;

  lobForm: FormGroup;
  clientForm: FormGroup;

  clients: any;
  clientGetAllSubscription: Subscription;

  lobs: any;
  lobGetAllSubscription: Subscription;

  forms: any = [];
  clientStorageSubscription: Subscription;
  userFormGetSubscription: Subscription;

  constructor(private clientService: ClientService,
              private formService: FormService,
              private lobService: LOBService,
              private globalService: GlobalService,
              private router: Router,
              private commonService: CommonService,
              private authService: AuthService,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {

    this._api_endpoint = this.appConfig.API_ENDPOINT;
    let _client = this.globalService.getClientCookie();
    this.is_admin = this.authService.auth.user.user.is_admin;
      if (_client) {
        this.selectedClient = _client;
      }

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
          }
        }
      );

      this.clientStorageSubscription = this.globalService.clientChange.subscribe(
        (client: any) => {
          if (typeof(client) !== 'undefined') {
            this.selectedClient = client;
            this.loading = true;
            this.commonService.httpGetUserForms(parseInt(client.id));
          }
        }
      );

  }

  onFormSelected(event) {
    if (event.dataset.form === undefined) {
    } else {
      this.globalService.setFormCookie(event.dataset.form);
    }
    this.globalService.setLOBCookie(event.dataset.lobid);
  }

  ngOnDestroy() {
    if (this.lobGetAllSubscription) this.lobGetAllSubscription.unsubscribe();
    if (this.clientStorageSubscription) this.clientStorageSubscription.unsubscribe();
  }
}

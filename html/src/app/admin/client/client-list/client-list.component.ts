import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { APP_CONFIG } from '../../../app.config';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-client-list',
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
  templateUrl: './client-list.component.html',
  styleUrls: ['./client-list.component.scss']
})
export class ClientListComponent implements OnInit, OnDestroy {

  public loading = false;
  public loading2 = false;
  public loadingEdit = false;

  datatable:                    any;
  _clients:                     any = [];
  _client:                      any;
  _api_endpoint:                string = '';
  _del_rec:                     any = { 
                                  _client_name: '',
                                  _id: 0,
                                  _logo: '/public/no_img.jpg'
                                };

  clientForm:                   FormGroup;
  selectedFile:                 File = null;

  _manage_client:               any = null;

  no_record_message: string = 'No records found.';

  clientGetAllSubscription:     Subscription;
  clientGetSubscription:        Subscription;
  clientPostSubscription:       Subscription;
  clientDeleteSubscription:     Subscription;
  clientPutSubscription:        Subscription;
  active_panel: any;
  _client_users: any;
  _lobs: any;

  constructor(private clientService: ClientService,
              private globalService: GlobalService,
              private router: Router,
              private route: ActivatedRoute,
              private titleService: Title,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Manage Clients');
    const $this = this;
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    this.clientService.httpGetAllClient();
    this.loading = true;
    $('#viewlist-table').hide();

    this.clientGetAllSubscription = this.clientService.clientGetAll.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this._clients = clients.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (clients.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }
        } else if (typeof(clients) !== 'undefined' && clients.success === false) {
          swal('Error', 'Unable to fetch records. <br><br>' + clients.message, 'error');
          this.no_record_message = 'No recourds found. ' + clients.message;
          this.loading = false;
        }
      }
    );

    this.clientPostSubscription = this.clientService.clientPost.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {
          swal('Client created', 'Successfully created new client.', 'success');
          this.onRefreshRecords();
          $("#btnCloseAdd").click();
          this.clientForm.reset();
          this.loading2 = false;
        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to create client', 'Unable to create client. <br><br>' + client.message, 'error');
          this.loading2 = false;
        }
        this.selectedFile = null;
      }
    );

    this.clientDeleteSubscription = this.clientService.clientDelete.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {
          swal('Client archived', 'Successfully archived client.', 'success');
          $("#btnCloseDelete").click();

          // clear localStorage/Cookie for selected client if client deleted is same
          const client_cookie = this.globalService.getClientCookie();

          if (client_cookie && (client_cookie.id === this._del_rec._id)) {
            this.globalService.deleteClientCookie();
          }

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._id)).remove().draw();

        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to archive', 'Unable to archive client. <br><br>' + client.message, 'error');
        }
      }
    );

    this.clientGetSubscription = this.clientService.clientGet.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {

          this._client = client.data;

          $('#edit_id').val(client.data.id);
          $('#edit_client_name').val(client.data.client_name);
          $('#edit_description').val(client.data.description);
          if (client.data.creator) {
            $('#edit_created_by').val(client.data.creator.first_name + ' ' + client.data.creator.last_name);
          } else {
            $('#edit_created_by').val('-');
          }
          $('#edit_created_at').val(client.data.created_at);
          $('#edit_modified_at').val(client.data.updated_at);

          const logo = (client.data.logo == '') ? '/public/no_img.jpg' : client.data.logo;
          $('#img_client').prop('src', this._api_endpoint + logo);
          $("#btnEditRecord").click();

        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to fetch client', 'Unable to fetch client. <br><br>' + client.message, 'error');
        }
      }
    );

    this.clientPutSubscription = this.clientService.clientPut.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {
          swal('Client updated', 'Successfully updated client.', 'success');
          this.onRefreshRecords();
          $("#btnCloseEdit").click();
          this.loadingEdit = false;
        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to update', 'Unable to update client. <br><br>' + client.message, 'error');
          this.loadingEdit = false;
        }
      }
    );

    this.initClientForm();
  }

  initClientForm() {
    const client_name = '';
    const description = '';
    const logo        = null;

    this.clientForm = new FormGroup({
      'client_name': new FormControl(client_name, Validators.required),
      'description': new FormControl(description, Validators.required),
      'logo': new FormControl(logo)
    });

  }

  onFileSelected(event) {

    if (event.target.files.length == 0) {
      return;
    }

    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/gif') {
      this.selectedFile = event.target.files[0];
    } else {
      swal('Invalid file type', 'You have selected a non-supported file type. Please choose JPEG, GIF or PNG.', 'error');
      event.target.value = null;
    }

  }

  onSaveRecord() {

    this.loading2 = true;

    const client_name: any = $('#client_name').val();
    const description: any = $('#description').val();
    const created_by: any = this.globalService.authService.auth.user.user.id;
    
    const fd = new FormData();
    
    fd.append('client_name', client_name);
    fd.append('description', description);
    fd.append('created_by', created_by);
    
    if (this.selectedFile) {
      fd.append('logo', this.selectedFile, this.selectedFile.name)
    }

    this.clientService.httpPostClient(fd);
  }

  onDelRecord(id, client_name, logo) {

    const _logo = (logo == '') ? '/public/no_img.jpg' : logo;

    this._del_rec = {
      _client_name: client_name,
      _id: id,
      _logo: _logo
    };
    
    $("#btnDeleteRecord").click();
  }

  onDeleteRecord(id) {
    this.clientService.httpDeleteClient(id);
  }

  onRefreshRecords() {
    this.loading = true;
    this.clientService.httpGetAllClient();  
    $('#viewlist-table').hide();
  }

  onEditRecord(id: any) {
    // get details of the selected item from API
    this.clientService.httpGetClient(id);
  }

  onUpdateRecord(id: any) {

    const fd = new FormData();
    
    this.loadingEdit = true;
    
    fd.append('client_name', $('#edit_client_name').val());
    fd.append('description', $('#edit_description').val());
    
    if (this.selectedFile) {
      fd.append('logo', this.selectedFile, this.selectedFile.name)
    }

    this.clientService.httpPutClient(id, fd);

  }

  onClientManage(client: any) {
    this.globalService.setClientCookie(client);
    this.router.navigate(['/home/' + client.id])
    // this.clientService.httpGetClientFull(client_id);    
    // $('#viewlist-client-user').hide();
  }
  
  ngOnDestroy() {
    if (this.clientGetAllSubscription)    this.clientGetAllSubscription.unsubscribe();
    if (this.clientGetSubscription)       this.clientGetSubscription.unsubscribe();
    if (this.clientPostSubscription)      this.clientPostSubscription.unsubscribe();
    if (this.clientDeleteSubscription)    this.clientDeleteSubscription.unsubscribe();
    if (this.clientPutSubscription)       this.clientPutSubscription.unsubscribe();
  }
}

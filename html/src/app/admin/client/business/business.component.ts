import { Component, OnInit, Inject } from '@angular/core';
import { LOBService } from '../../../services/lob.service';
import { Subscription } from 'rxjs';
import { APP_CONFIG } from '../../../app.config';
import { ClientService } from '../../../services/client.service';
import { GlobalService } from '../../../services/global.service';
import { trigger, transition, style, animate } from '@angular/animations';

import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';

declare var $: any;

@Component({
  selector: 'app-business',
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
  templateUrl: './business.component.html',
  styleUrls: ['./business.component.scss']
})
export class BusinessComponent implements OnInit {

  public loading = false;
  public loading2 = false;

  datatable:                  any;

  _lob:                       any;
  _lobs:                      any = [];
  _clients:                   any = [];
  _selected_client:             any;

  _del_rec:                   any = {
                                _lob_id: '',
                                _lob_name: '',
                                _description: ''
                              };

  no_record_message: string = 'No records found.';

  lobGetAllSubscription:      Subscription;
  clientGetAllSubscription:   Subscription;
  lobPostSubscription:        Subscription;
  lobGetSubscription:         Subscription;
  lobPutSubscription:         Subscription;
  lobDeleteSubscription:      Subscription;

  constructor(private lobService: LOBService,
              private clientService: ClientService,
              private titleService: Title,
              private globalService: GlobalService,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {
    // set page title
    this.titleService.setTitle('Connext Forms - Lines of Business');
    const $this = this;
    this.lobService.httpGetAllLOB();
    this.loading = true;
    $('#viewlist-table').hide();

    this.lobGetAllSubscription = this.lobService.lobGetAll.subscribe(
      (lobs: any) => {
        if (typeof(lobs) !== 'undefined' && lobs.success) {
          this._lobs = lobs.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (lobs.count > 0) {
            $('#viewlist-table').hide();
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }
        } if (typeof(lobs) !== 'undefined' && lobs.success == false) {
          swal('Error', 'Unable to fetch records. <br><br>' + lobs.message, 'error');
          this.no_record_message = 'No recourds found. ' + lobs.message;
          this.loading = false;
        }
      }
    );

    this.clientGetAllSubscription = this.clientService.clientGetAll.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this._clients = clients.data;
          this.loading2 = false;
        } else if (typeof(clients) !== 'undefined' && clients.success === false) {
          this.loading2 = false;
        }
      }
    );

    this.lobGetSubscription = this.lobService.lobGet.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          this._lob = lob.data;

          $('#edit_client').val(lob.data.client_id);
          $('#edit_lob_name').val(lob.data.lob_name);
          $('#edit_description').val(lob.data.description);
          $('#edit_location').val(lob.data.location);

          $("#btnEditRecord").click();

        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Error', 'Unable to fetch line of business. <br><br>' + lob.message, 'error');
        }
      }
    )

    this.lobPostSubscription = this.lobService.lobPost.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('LOB created', 'Successfully created a new line of business.', 'success');
          $('#btnCloseAdd').click();
          this.onRefreshRecords();
          this._selected_client = null;
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Create failed', 'Unable to create line of business. <br><br>' + lob.message, 'error');
        }
      }
    );

    this.lobPutSubscription = this.lobService.lobPut.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('Updated record', 'Successfully updated line of business.', 'success');
          $('#btnCloseEdit').click();
          this.onRefreshRecords();
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Update failed', 'Unable to update line of business. <br><br>' + lob.message, 'error');
        }
      }
    );

    this.lobDeleteSubscription = this.lobService.lobDelete.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('Archived record', 'Successfully archived line of business record.', 'success');
          $('#btnCloseDelete').click();

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._lob_id)).remove().draw();
                    
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Archive failed', 'Unable to archive line of business. <br><br>' + lob.message, 'error');
        }
      }
    )
  }

  onRefreshRecords() {
    this.lobService.httpGetAllLOB();
    this.loading = true;
    $('#viewlist-table').hide();
  }

  onEditRecord(id: any) {
    this.clientService.httpGetAllClient();
    // get details of the selected item from API
    this.lobService.httpGetLOBById(id);
  }

  onUpdateRecord(id: any) {
    const data = {
      client_id:      $('#edit_client').val(),
      lob_name:       $('#edit_lob_name').val(),
      description:    $('#edit_description').val(),
    };
    this.lobService.httpPutLOB(id, data);
  }

  onAddRecord() {
    this.loading2 = true;
    this.clientService.httpGetAllClient();
  }

  onSaveRecord() {
    let fd = new FormData();

    if (this._selected_client) {
      const lob_name = $('#lob_name').val();
      if (lob_name === '') {
        swal('No LOB name', 'Please supply Line of Busineess name before proceeding.', 'error');
        return;
      }
      fd.append('lob_name', lob_name);
      fd.append('client_id', this._selected_client.id);
      fd.append('description', $('#description').val());
      fd.append('created_by', this.globalService.authService.auth.user.user.id);
      this.lobService.httpPostLOB(fd);
    } else {
      swal('No client selected', 'Please select client before proceeding.', 'error');
    }
  }

  onCloseModal() {
    this._selected_client = null;
  }

  onDelRecord(id, name, description) {

    this._del_rec = {
      _lob_id: id ,
      _lob_name: name,
      _lob_location: description,
    };
    
    $("#btnDeleteRecord").click();
  }

  onDeleteRecord(id) {
    this.lobService.httpDeleteLOB(id);
  }

  ngOnDestroy() {
    this.lobGetAllSubscription.unsubscribe();
    this.clientGetAllSubscription.unsubscribe();
    this.lobPostSubscription.unsubscribe();
    this.lobGetSubscription.unsubscribe();
    this.lobPutSubscription.unsubscribe();
    this.lobDeleteSubscription.unsubscribe();
  }

}

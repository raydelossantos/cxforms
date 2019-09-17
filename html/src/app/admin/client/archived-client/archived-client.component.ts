import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { ClientService } from '../../../services/client.service';
import swal from 'sweetalert2';
import { APP_CONFIG } from '../../../app.config';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-archived-client',
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
  templateUrl: './archived-client.component.html',
  styleUrls: ['./archived-client.component.scss']
})
export class ArchivedClientComponent implements OnInit {

  public loading = false;
  datatable: any;
  _archived_clients: any = [];
  _api_endpoint: string = '';

  no_record_message: string = 'No records found.';

  clientGetAllDeletedSubscription: Subscription;
  clientPostRestoreSubscription: Subscription;
  restore_id: any;

  constructor(private clientService: ClientService,
              private titleService: Title,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Archived Clients');
    const $this = this;
    this.clientService.httpGetAllDeletedClient();
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    this.loading = true;
    $('#viewlist-table').hide();

    this.clientGetAllDeletedSubscription = this.clientService.clientGetAllDeleted.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this._archived_clients = clients.data;

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
          
        } if (typeof(clients) !== 'undefined' && clients.success == false) {
          swal('Error', 'Unable to fetch records. <br><br>' + clients.message, 'error');
          this.no_record_message = 'No recourds found. ' + clients.message;
          this.loading = false;
        }
      }
    );

    this.clientPostRestoreSubscription = this.clientService.clientPostRestore.subscribe(
      (client: any) => {
        if (typeof (client) !== 'undefined' && client.success) {
          swal('Restored', 'Successfully restored client.', 'success');

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this.restore_id)).remove().draw();
          this.loading = false;

        } else if (typeof (client) !== 'undefined' && client.success === false) {
          swal('Restore failed', 'Unable to restore client. <br><br>' + client.message, 'error');
        }
      }
    );
    
  }

  ngOnDestroy() {
    this.clientGetAllDeletedSubscription.unsubscribe();
  }

  onRestoreRecord(id: any) {
    this.loading = true;
    this.clientService.httpPostRestoreClient(id);
    this.restore_id = id;
  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.clientService.httpGetAllDeletedClient();  
  }

  ngOndDestroy() {
    this.clientGetAllDeletedSubscription.unsubscribe();
  }

}

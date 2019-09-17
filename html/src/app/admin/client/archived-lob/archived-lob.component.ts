import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { APP_CONFIG } from '../../../app.config';
import { LOBService } from '../../../services/lob.service';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-archived-lob',
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
  templateUrl: './archived-lob.component.html',
  styleUrls: ['./archived-lob.component.scss']
})
export class ArchivedLobComponent implements OnInit {

  public loading = false;
  datatable: any;
  _archived_lobs: any = [];
  _api_endpoint: string = '';

  no_record_message: string = 'No records found.';

  lobGetAllDeletedSubscription: Subscription;
  lobPostRestoreSubscription: Subscription;
  restore_id: any;

  constructor(private lobService: LOBService,
              @Inject (APP_CONFIG) private appConfig,
              private titleService: Title,) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Archived LOB');
    const $this = this;
    this.lobService.httpGetAllDeletedLOB();
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    this.loading = true;
    $('#viewlist-table').hide();

    this.lobGetAllDeletedSubscription = this.lobService.lobGetAllDeleted.subscribe(
      (lobs: any) => {
        if (typeof(lobs) !== 'undefined' && lobs.success) {
          this._archived_lobs = lobs.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (lobs.count > 0) {
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

    this.lobPostRestoreSubscription = this.lobService.lobPostRestore.subscribe(
      (lob: any) => {
        if (typeof (lob) !== 'undefined' && lob.success) {
          swal('Restored', 'Line of business was restored successfully.', 'success');

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this.restore_id)).remove().draw();
          this.loading = false;
          
        } else if (typeof (lob) !== 'undefined' && lob.success === false) {
          swal('Restore failed', 'Unable to restore line of business. <br><br>' + lob.message, 'error');
        }
      }
    );
    
  }

  ngOnDestroy() {
    this.lobGetAllDeletedSubscription.unsubscribe();
  }

  onRestoreRecord(id: any) {
    this.loading = true;
    this.lobService.httpPostRestoreLOB(id);
    this.restore_id = id;
  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.lobService.httpGetAllDeletedLOB();  
  }

  ngOndDestroy() {
    this.lobGetAllDeletedSubscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FieldService } from '../../../../services/field.service';
import swal from 'sweetalert2';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-archive',
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
  templateUrl: './archive.component.html',
  styleUrls: ['../arrange/arrange.component.scss','./archive.component.scss']
})
export class ArchiveComponent implements OnInit, OnDestroy {
  fieldGetDeletedSubscription: Subscription;
  restoreFieldSubscription: Subscription;
  loading = false;
  loading_message = 'Fetching information...';
  no_record_message: string = 'No records found.';
  _deletedFormFields: any;
  datatable: any;
  _del_rec: any = { _id: '' };
  _url_parts: any;

  constructor(private router: Router,
    private fieldService: FieldService
    ) { }

  ngOnInit() {
    const $this = this;
    this.loading = true;
    $('#viewlist-table').hide();
    this._url_parts = this.router.url.split('/');

    this.fieldService.httpGetDeleted(this._url_parts[2]);
    this.fieldGetDeletedSubscription = this.fieldService.formGetDeletedFields.subscribe(
      (deletedFormFields: any) => {
        if(typeof(deletedFormFields) !== 'undefined' && deletedFormFields.success) {
          this._deletedFormFields = deletedFormFields.data;

          if ($.fn.dataTable.isDataTable('#viewlist-table')){
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (deletedFormFields.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }
        } else if (typeof(deletedFormFields) !== 'undefined' && deletedFormFields.success == false) {
          swal('Error', 
           'Unable to fetch archived form records. <br><br>' + deletedFormFields.message, 'error');

          this.no_record_message = 'No records found. ' + deletedFormFields.message;
          this.loading = false;
        }
      }
    );

    this.restoreFieldSubscription = this.fieldService.restoreField.subscribe(
      (field: any) => {
        if(typeof(field) !== 'undefined' && field.success) {
          swal('Restored', 'Field has been successfully restored.', 'success');

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._id)).remove().draw();

          this.fieldService.httpGetAllField({'form_id': this._url_parts[2]}, this._url_parts[2]);
        } else if(typeof(field) !== 'undefined' && field.success === false) {
          swal('Failed to delete', 'Unable to delete the record. <br><br>' + field.message, 'error');
        }
      }
    );
  }

  ngOnDestroy() {
    if(typeof(this.fieldGetDeletedSubscription) !== 'undefined')
      this.fieldGetDeletedSubscription.unsubscribe();

    if(typeof(this.restoreFieldSubscription) !== 'undefined')
      this.restoreFieldSubscription.unsubscribe();
  }

  onRefreshRecords() {
    $('#viewlist-table').fadeOut();
    this.loading = true;
    this.fieldService.httpGetDeleted(this._url_parts[2]);
  }

  onRestoreRecord(id: any) {
    const that = this;
    this._del_rec._id = id;
    let form_id = this._url_parts[2];

    swal({title: 'Are you sure?',
	      text: "This field will be restored",
	      type: 'warning',
	      showCancelButton: true,
	      confirmButtonColor: '#3085d6',
	      cancelButtonColor: '#d33',
	      confirmButtonText: 'Yes, restore it!'
	    }).then(function(result) {
	      if (result.value) {
          that.fieldService.httpRestore({field_id: id,
            form_id: form_id
          });
	      }
      });
  }
}

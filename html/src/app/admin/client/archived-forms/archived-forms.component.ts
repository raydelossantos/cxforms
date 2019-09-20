import { Component, OnInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import { Title } from '@angular/platform-browser';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-archived-forms',
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
  templateUrl: './archived-forms.component.html',
  styleUrls: ['./archived-forms.component.scss']
})
export class ArchivedFormsComponent implements OnInit {

  public loading = false;

  datatable: any;
  _archived_forms: any = [];
  formGetAllDeletedSubscription: Subscription;
  formPostRestoreSubscription: Subscription;
  
  no_record_message: string = 'No records found.';
  restore_id: any;

  constructor(private formService: FormService,
              private titleService: Title,
              ) { }

  ngOnInit() {

    this.loading = true;
    this.titleService.setTitle('QA-Gold - Archived Forms');
    $('#viewlist-table').hide();

    const $this = this;

    this.formService.httpGetAllDeletedForm();
    this.formGetAllDeletedSubscription = this.formService.formGetAllDeleted.subscribe(
      (forms: any) => {
        if (typeof(forms) !== 'undefined' && forms.success) {
          this._archived_forms = forms.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (forms.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }

        } else if (typeof(forms) !== 'undefined' && forms.success === false) {
          swal('Error', 'Unable to fetch archived form records. <br><br>' + forms.message, 'error');
          this.no_record_message = 'No records found. ' + forms.message;
          this.loading = false;
        }
      }
    );

    this.formPostRestoreSubscription = this.formService.formPostRestore.subscribe(
      (form: any) => {
        if (typeof(form) !== 'undefined' && form.success) {
          // swal('Form restored', 'Successfully restored form. This form may be accessible to those with permission.', 'success');
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Successfully restored form. This form may be accessible to those with permission.',
            showConfirmButton: false,
            timer: 1500
          });
          
          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this.restore_id)).remove().draw();
          this.loading = false;

          $('#viewlist-table').fadeIn();
        } else if (typeof(form) !== 'undefined' && form.success) {
          swal('Restore failed', 'Unable to restore form. <br><br>' + form.message, 'error');
          this.loading = false;
        }
      }
    );
  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide
    this.formService.httpGetAllDeletedForm();
  }

  onRestoreRecord(id: any) {
    const that = this;

    swal({
      title: 'Restore archived form?',
      text: "It will be listed back to active forms and it will be accessible to users with permissions.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.restore_id = id;
        that.formService.httpPostRestoreForm(id);
      }
    });
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { FieldService } from '../../../services/field.service';
import { FormService } from '../../../services/form.service';
import { Router, ActivatedRoute } from '@angular/router';
import { DefaultTableService } from '../../../services/dafault.table.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import * as moment from 'moment';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { GlobalService } from '../../../services/global.service';

declare var $: any;

@Component({
  selector: 'app-export',
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
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.scss']
})
export class ExportComponent implements OnInit, OnDestroy {

  public loading = false;

  options:              any;
  datatable:            any;

  _form_id:             any;
  _form_title:          string ='';
  _fields:              any;
  _selectedFields:      any = [];

  _start_date:          any;
  _end_date:            any;

  _include_creator:     boolean = false;
  _include_modifier:    boolean = false;
  _include_filter:      boolean = false;

  _export_fields:       any;
  _export_records:      any;
  _export_title:        string = 'No export data processed.';
  _export_fields_title: string;
  _export_filter_row:   number = 0;

  _custom_filters:      any = [];

  max_date:             string;
  min_date:             string;

  _default_fields: any = [
    { id: '-1', form_field_name: 'id',                       label: 'ID'                       },
    { id: '-1', form_field_name: 'date_created',             label: 'Date Created'             },
    { id: '-1', form_field_name: 'created_by_userid',        label: 'Created By User ID'       },
    { id: '-1', form_field_name: 'created_by_username',      label: 'Created By Username'      },
    { id: '-1', form_field_name: 'last_modified_by_userid',  label: 'Last Modified By User ID' },
    { id: '-1', form_field_name: 'date_last_modified',       label: 'Date Last Modified'       },
    { id: '-1', form_field_name: 'assigned_to_userid',       label: 'Assigned To User ID'      },
    { id: '-1', form_field_name: 'assigned_to_role',         label: 'Assigned To Role'         },
    { id: '-1', form_field_name: 'date_assigned',            label : 'Date Assigned'           },
  ];  
  
  _filter_operators = [
    { id: 0, value: '=',        label: 'Equal to'                 },
    { id: 1, value: 'like',     label: 'Like'                     },
    { id: 2, value: '<>',       label: 'Not equal to'             },
    { id: 3, value: '<',        label: 'Less than'                },
    { id: 4, value: '>',        label: 'Greater than'             },
    { id: 5, value: '<=',       label: 'Less than or equal to'    },
    { id: 5, value: '>=',       label: 'Greater than or equal to' },
  ];

  formSubscription:   Subscription;
  recordSubscription: Subscription;

  constructor(private fieldService: FieldService,
              private globalService: GlobalService,
              private formService: FormService,
              private titleService: Title,
              private router: Router,
              private route: ActivatedRoute,
              private defaultTableService: DefaultTableService) { }

  ngOnInit() {
    const $this = this;

    this.min_date = '2018-09-01';
    this.max_date = moment().format('YYYY-MM-DD');

    const today = new Date();

    let _client = this.globalService.getClientCookie();

    // this.min_date = today.getDate() + '-'

    /** Set default date for export :: TODAY */
    this._start_date  = moment().format('YYYY-MM-DD');
    this._end_date    = moment().format('YYYY-MM-DD');

    const _url = this.router.url.split("/");
    const _form_id = _url[2];
    this._form_id = _form_id;

    if (_form_id !== 'new') {
      this.loading = true;

      this.formService.httpGetFormExportById(this._form_id);

      this.formSubscription = this.formService.formGetExport.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {
            this._form_title = form.data['form_name'];
            this.titleService.setTitle('Connext Forms - ' + form.data.form_name + ' - Export');
            this._export_title = 'No export data processed for ' + form.data['form_name'] +  '' ;
            this._fields = [...this._default_fields, ...form.data.fields];

            this.loading = false;
          } else if (typeof (form) !== 'undefined' && form.success === false) {

            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')

            if (_client) {
              this.router.navigate(['/home/' + _client.id]);
            } else {
              this.router.navigate(['/home']);
            }

            this.loading = false;
          }
        }
      );

      this.recordSubscription = this.defaultTableService.recordExport.subscribe(
        (records: any) => {
          if (typeof(records) !== 'undefined' && records.success) {
            this._export_title = this._form_title;

            if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
              $("#viewlist-table").dataTable().fnDestroy();
            }

            if (records.count > 0) {

              this._export_fields_title = records.fields_title;
              this._export_fields = records.fields;
              this._export_records = records.data;

              if (records.fields.indexOf('created_by_userid') !== -1 && this._include_creator) {

                // get created_by_userid column index
                const cbu_index = records.fields.indexOf('created_by_userid');

                // insert export fields from creator/user in the array to display in datatable
                records.fields_title.splice((cbu_index + 1), 0, 'Created By Employee ID');
                records.fields_title.splice((cbu_index + 2), 0, 'Created By Name');
                records.fields_title.splice((cbu_index + 3), 0, 'Created By Email');

                this._export_fields_title = records.fields_title;

                // add fields from creator
                records.fields.splice((cbu_index + 1), 0, 'created_by_employee_id');
                records.fields.splice((cbu_index + 2), 0, 'created_by_full_name');
                records.fields.splice((cbu_index + 3), 0, 'created_by_email');

                this._export_fields = records.fields;

                // insert data to of creator in the exported data
                records.data.map(
                  (rec: any) => {
                    rec.created_by_full_name = rec.creator.last_name + ', ' + rec.creator.first_name + ' ' + rec.creator.middle_name;
                    rec.created_by_employee_id = rec.creator.employee_id;
                    rec.created_by_email = rec.creator.email;
                    return rec;
                  }
                );
                this._export_records = records.data;
              }

              if (records.fields.indexOf('last_modified_by_userid') !== -1 && this._include_modifier) {

                // get last_modified_by_userid column index
                const lmbu_index = records.fields.indexOf('last_modified_by_userid');

                // insert export fields from last modified in the array to display in datatable
                records.fields_title.splice((lmbu_index + 1), 0, 'Last Modified By Employee ID');
                records.fields_title.splice((lmbu_index + 2), 0, 'Last Modified By Name');
                records.fields_title.splice((lmbu_index + 3), 0, 'Last Modified By Email');

                this._export_fields_title = records.fields_title;

                // add fields from modifier
                records.fields.splice((lmbu_index + 1), 0, 'modified_by_employee_id');
                records.fields.splice((lmbu_index + 2), 0, 'modified_by_full_name');
                records.fields.splice((lmbu_index + 3), 0, 'modified_by_email');

                this._export_fields = records.fields;


                // insert data to of creator in the exported data
                records.data.map(
                  (rec: any) => {
                    if (rec.modifier !== null) {
                      rec.modified_by_full_name = rec.modifier.last_name + ', ' + rec.modifier.first_name + ' ' + rec.modifier.middle_name;
                      rec.modified_by_employee_id = rec.modifier.employee_id;
                      rec.modified_by_email = rec.modifier.email;
                      return rec;
                    } else {
                      rec.modified_by_full_name = '';
                      rec.modified_by_employee_id = '';
                      rec.modified_by_email = '';
                      return rec;
                    }
                  }
                );
                this._export_records = records.data;
              }

              setTimeout(() => {
                $this.datatable = $('#viewlist-table').dataTable({
                  dom: 'lBfrtip',
                  buttons: [
                    {
                      extend: 'excelHtml5',
                      text:   '<i class="fa fa-fw fa-download"></i> Excel',
                      messageTop: 'Exported: ' + this._form_title + ' | ' + this._start_date + ' to ' + this._end_date,
                    },
                    {
                      extend: 'pdfHtml5',
                      text:   '<i class="fa fa-fw fa-download"></i> PDF',
                      messageTop: 'Exported: ' + this._form_title + ' | ' + this._start_date + ' to ' + this._end_date
                    },
                    {
                      extend: 'csvHtml5',
                      text:   '<i class="fa fa-fw fa-download"></i> CSV',
                    }
                  ]
                });
                swal('Export request completed', 'Export request has completed, review the export details.', 'success');
                $('#btnExportResults').click();
                this.loading = false;
              }, 500);
            } else {
              swal('No export data', 'Export request has been completed but yeild no results.', 'info');
              this.loading = false;
            }
          } else if (typeof(records) !== 'undefined' && !records.success) {
            this.loading = false;
            swal('Export failed', 'Unable to process export request. <br><br>' + records.message, 'error');
            this.loading = false;
          }
        }
      );

    } else {
      this.router.navigate(['/home']);
    }

  }

  onExport() {

    this.loading = true;

    var checked = $('.chk_export:checkbox:checked')
                  .map(
                    function() {
                      return { title: this.title, id: this.id };
                    }
                  ).get();

    if (checked.length > 0) {
      if (this._start_date !== '' && this._end_date !== '') {
        const isAfter = moment(this._start_date).isAfter(this._end_date);

        if (isAfter) {
          swal('Invalid date range', '`TO` should be later than `FROM`.', 'warning');
          this.loading = false;
          return;
        }

        var custom_filter: any = [];

        /** Set default date for export :: TODAY */
        this._start_date  = moment(this._start_date).format('YYYY-MM-DD');
        this._end_date    = moment(this._end_date).format('YYYY-MM-DD');

        if (this._custom_filters.length > 0) {
          $("#custom_filter li").each(
            function () {
              if ($(this).find('.filter_column').val() !== '') {
                custom_filter.push({
                  column: $(this).find('.filter_column').val(),
                  option: $(this).find('.filter_option').val(),
                  text:   $(this).find('.filter_text').val()
                });
              }
            }
          );
        }

        const data = {
          fields:     checked,
          start_date: this._start_date,
          end_date:   this._end_date,
          include_creator: this._include_creator,
          include_modifier: this._include_modifier,
          filter: custom_filter
        };

        this.defaultTableService.httpPostExportData(this._form_id, data);

      } else {
        swal('No date selected', 'Set the `From` & `To` date fields to continue.', 'warning');
        this.loading = false;
      }

    } else {
      swal('No export data selected', 'Select fields to export by ticking the checkboxes.', 'warning');
      this.loading = false;
    }

  }

  onDateRangeClick(event) {

    if (event == 'Today') {
      this._start_date  = moment().format('YYYY-MM-DD');
      this._end_date    = moment().format('YYYY-MM-DD');
    } else if (event == 'Yesterday') {
      // less one day from today
      this._start_date  = moment().subtract(1,'day').format('YYYY-MM-DD');
      this._end_date    = moment().subtract(1,'day').format('YYYY-MM-DD');
    } else if (event == 'This Week') {
      // compute this week start and end date
      this._start_date = moment().startOf('week').format('YYYY-MM-DD');

      const today = moment().format('YYYY-MM-DD');
      const end_date   = moment().endOf('week').format('YYYY-MM-DD');

      if (end_date > today) {
        this._end_date   = moment().format('YYYY-MM-DD');
      } else {
        this._end_date   = moment().endOf('week').format('YYYY-MM-DD');
      }

    } else if (event == 'Last Week') {
      // get last weeks dates
      this._start_date = moment().subtract(1, 'week').startOf('week').format('YYYY-MM-DD');
      this._end_date   = moment().subtract(1, 'week').endOf('week').format('YYYY-MM-DD');
    }
  }

  onAddFilter() {
    this._export_filter_row++;
    this._custom_filters.push({
      id: this._export_filter_row
    });
  }

  onRemoveFilter(filter_id) {
    var index = -1;
    var filters = eval( this._custom_filters );
    for( var i = 0; i < filters.length; i++ ) {
      if( filters[i].id === filter_id) {
        index = i;
        break;
      }
    }
    if( index === -1 ) {
      swal('Error', 'Something went wrong.', 'error');
    }
    this._custom_filters.splice( index, 1 );
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {

    if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
      $("#viewlist-table").dataTable().fnDestroy();
    }

    if (typeof(this.formSubscription)) this.formSubscription.unsubscribe();
    if (typeof (this.recordSubscription)) this.recordSubscription.unsubscribe();

  }

}

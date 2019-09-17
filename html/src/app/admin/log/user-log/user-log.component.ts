import { Component, OnInit, trigger, transition, style, animate } from '@angular/core';
import { LogService } from '../../../services/log.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-user-log',
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
  templateUrl: './user-log.component.html',
  styleUrls: ['./user-log.component.scss']
})

export class UserLogComponent implements OnInit {

  constructor(private logService: LogService,
              private titleService: Title,
              private router: Router
              ) { }

  public loading = false;
  public loading_tags = false;
  user_logs: any = [];
  datatable: any;
  _form_id: any;
  _export_filter_row: number = 0;
  no_record_message:            string = 'No records found.';
  _custom_filters: any = [{
                           id: 0
                         }];
  _all_fields_default = [
    {id: 0, value: 'id',         label: 'ID'},
    {id: 1, value: 'activity',   label: 'Activity'},
    {id: 2, value: 'ip_address', label: 'IP Address'},
    {id: 3, value: 'created_at', label: 'Date'},
  ];
  _filter_operators = [
    { id: 0, value: '=',        label: 'Equal to'                 },
    { id: 1, value: 'like',     label: 'Like'                     },
    { id: 2, value: '<>',       label: 'Not equal to'             },
    { id: 3, value: '<',        label: 'Less than'                },
    { id: 4, value: '>',        label: 'Greater than'             },
    { id: 5, value: '<=',       label: 'Less than or equal to'    },
    { id: 6, value: '>=',       label: 'Greater than or equal to' },
  ];

  userLogGetAllSubscription: Subscription;
  filterGetAllSubscription: Subscription;

  ngOnInit() {
    const $this = this;
    const _url = this.router.url.split('/');
    const _form_id = _url[2];
    this._form_id = _form_id;
    this.titleService.setTitle('Connext Forms - User Logs');
    this.logService.httpGetAllUserLogs();
    this.loading = true;
    $('#viewlist-table').hide();

    this.userLogGetAllSubscription = this.logService.userGetAll.subscribe(
      (user_logs: any)  => {
        if (typeof(user_logs) !== 'undefined' && user_logs.success) {
          this.user_logs = user_logs.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }
          const $this = this;

          if (user_logs.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable({
                order: [[ 0, "desc" ]]
              });
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }

        } else if (typeof(user_logs) !== 'undefined' && user_logs.success === false) {

        }
      }
    );

    this.filterGetAllSubscription = this.logService.filterGetAll.subscribe(
      (user_logs: any)  => {
        if (typeof(user_logs) !== 'undefined' && user_logs.success) {
          this.user_logs = user_logs.data;
          $('#viewlist-table').hide();
          $('#btnCloseFilterRecord').click();

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }
          const $this = this;

          if (user_logs.count > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable({
                order: [[ 0, "desc" ]]
              });
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }

        } else if (typeof(user_logs) !== 'undefined' && user_logs.success === false) {
          swal('Connection error', 'Unable to fecth records. <br><br>' + user_logs.message, 'error');
          this.no_record_message = 'No records found. ' + user_logs.message;
          this.loading = false;
          $('#viewlist-table').hide();
        }
      }
    );
  }

  onRefreshRecords() {
    this.logService.httpGetAllUserLogs();
    this.loading = true;
    $('#viewlist-table').hide();
  }

  ngOnDestroy() {
    this.userLogGetAllSubscription.unsubscribe();
    if(this.filterGetAllSubscription) this.filterGetAllSubscription.unsubscribe();
  }

  onAddFilter() {
    this._export_filter_row++;
    this._custom_filters.push({
      id: this._export_filter_row
    });
  }

  onFilterRecords() {
    var custom_filter: any = [];

    if(this._custom_filters.length > 0) {
      $("#custom_filter li").each(
        function () {
          var column = $(this).find('.filter_column').val();

          if(column !== '' && column !== null) {
            custom_filter.push({
              column: $(this).find('.filter_column').val(),
              option: $(this).find('.filter_operator').val(),
              text: $(this).find('.filter_text').val()
            });
          }
        }
      );

      if(custom_filter.length > 0) {
        const data = {
          filter: custom_filter
        };

        this.loading = true;
        this.logService.httpPostFilter(data);
      } else {
        swal('Invalid filter', 'Kindly select and set filters properly before proceeding.', 'error');
      }
    }
  }

  onRemoveFilter(filter_id) {
    var index = -1;
    var filters = eval(this._custom_filters);
    for(var i = 0; i < filters.length; i++) {
      if(filters[i].id === filter_id) {
        index = i;
      }
    }

    if(index === -1) {
      swal('Error', 'Something went wrong.', 'error');
    }
    this._custom_filters.splice(index, 1);
  }
}

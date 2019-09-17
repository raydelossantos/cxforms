import { Component, OnInit, trigger, transition, style, animate, OnDestroy } from '@angular/core';
import { LogService } from '../../../services/log.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';

declare var $: any;

@Component({
  selector: 'app-mail',
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
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})

export class MailComponent implements OnInit, OnDestroy {

  constructor(private logService: LogService,
              private titleService: Title,
              ) { }

  public loading = false;
  public loading_tags = false;
  mail_logs: any = [];
  datatable: any;
  _export_filter_row: number = 0;
  no_record_message: string = 'No records found.';
  _custom_filters: any = [{id: 0}];
  _all_fields_default = [
    {id: 0, value: 'id',         label: 'ID'},
    {id: 1, value: 'receiver',   label: 'Receiver'},
    {id: 2, value: 'sender',     label: 'Sender'},
    {id: 3, value: 'link',       label: 'Link'},
    {id: 4, value: 'is_sent',    label: 'Sent'},
    {id: 5, value: 'is_opened',  label: 'Opened'},
    {id: 6, value: 'created_at', label: 'Date'}
  ];
  _filter_operators = [
    {id: 0, value: '=',    label: 'Equal to'},
    {id: 1, value: 'like', label: 'Like'},
    {id: 2, value: '<>',   label: 'Not equal to'},
    {id: 3, value: '<',    label: 'Less than'},
    {id: 4, value: '>',    label: 'Greater than'},
    {id: 5, value: '<=',   label: 'Less than or equal to'},
    {id: 6, value: '>=',   label: 'Greater than or equal to'},
  ];

  filterGetAllSubscription: Subscription;
  mailLogGetAllSubscription: Subscription;

  ngOnInit() {

    this.titleService.setTitle('Connext Forms - Mail Logs');
    this.logService.httpGetAllMailLogs();
    this.loading = true;
    $('#viewlist-table').hide();

    this.mailLogGetAllSubscription = this.logService.mailGetAll.subscribe(
      (mail_logs: any)  => {
        if (typeof(mail_logs) !== 'undefined' && mail_logs.success) {
          this.mail_logs = mail_logs.data;

          mail_logs.data.map(
            (mail: any) => {
              var _receiver = JSON.parse(mail.receiver);
              mail.receiver_email = _receiver[1];

              var sender = JSON.parse(mail.sender);
              mail.sender = sender[0];
              mail.sender_email = sender[1];

              return mail;
            }
          );

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }
          const $this = this;

          if (mail_logs.count > 0) {
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

        } else if (typeof(mail_logs) !== 'undefined' && mail_logs.success === false) {

        }
      }
    );

    this.filterGetAllSubscription = this.logService.mailFilterGetAll.subscribe(
      (mail_logs: any) => {
        if(typeof(mail_logs) !== 'undefined' && mail_logs.success) {
          this.mail_logs = mail_logs.data;

          mail_logs.data.map(
            (mail: any) => {
              var _receiver = JSON.parse(mail.receiver);
              mail.receiver_email = _receiver[1];

              var sender = JSON.parse(mail.sender);
              mail.sender = sender[0];
              mail.sender_email = sender[1];

              return mail;
            }
          );

          $('#viewlist-table').hide();
          $('#btnCloseFilterRecord').click();

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }
          const $this = this;

          if(mail_logs.count > 0) {
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
        } else if (typeof(mail_logs) !== 'undefined' && mail_logs.success === false) {
          swal('Connection error', 'Unable to fecth records. <br><br>' + mail_logs.message, 'error');
          this.no_record_message = 'No records found. ' + mail_logs.message;
          this.loading = false;
          $('#viewlist-table').hide();
        }
      }
    );
  }

  onRefreshRecords() {
    this.logService.httpGetAllMailLogs();
    this.loading = true;
    $('#viewlist-table').hide();
  }

  onShowLink(link: any) {
    const that = this;
    swal({
      title: 'Copy link to clipboard?',
      text: link,
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, copy it!'
    }).then(function(result) {
      if (result.value) {
        that.copyText(link);
      }
    });
  }

  copyText(text: any){
    var textArea = document.createElement("textarea");
    textArea.style.position = 'fixed';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');

      swal({
        position: 'top-end',
        type: 'success',
        title: 'Link has been placed to clipboard',
        showConfirmButton: false,
        timer: 1500
      })

    } catch (err) {
      console.log('Oops, unable to copy');
    }
    document.body.removeChild(textArea);
  }

  ngOnDestroy() {
    this.mailLogGetAllSubscription.unsubscribe();
    if(this.filterGetAllSubscription) this.filterGetAllSubscription.unsubscribe();
  }

  onAddFilter() {
    this._export_filter_row++;
    this._custom_filters.push({
      id: this._export_filter_row
    });
  }

  onRemoveFilter(filter_id) {
    let index = -1;
    let filters = eval(this._custom_filters);
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
        this.logService.httpPostFilterMail(data);
      } else {
        swal('Invalid filter', 'Kindly select and set filters properly before proceeding.', 'error');
      }
    }
  }
}

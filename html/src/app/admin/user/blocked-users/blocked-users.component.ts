import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';
import { APP_CONFIG } from '../../../app.config';

declare var $: any;

@Component({
  selector: 'app-blocked-users',
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
  templateUrl: './blocked-users.component.html',
  styleUrls: ['./blocked-users.component.scss']
})
export class BlockedUsersComponent implements OnInit, OnDestroy {

  public loading = false;

  datatable: any;
  _blocked_users: any = [];

  no_record_message: string = 'No records found.';

  userGetAllSubscription: Subscription;
  userGetAllInvalidLoginSubscription: Subscription;
  userPutUnblockSubscription: Subscription;

  _restore: any = '';

  constructor(@Inject (APP_CONFIG) private appConfig,
              private userService: UserService,
              private titleService: Title) { }

  ngOnInit() {
    // set page title
    this.titleService.setTitle('Connext Forms - Blocked Accounts');
    const $this = this;
    this.userService.httpGetAllUser({login_attempt: 5});
    this.loading = true;
    $("#viewlist-table").hide();

    this.userGetAllSubscription = this.userService.userGetAll.subscribe(
      (records: any) => {
        if (typeof(records) !== 'undefined' && records.success) {
          this._blocked_users = records.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (records.data.length > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $("#viewlist-table").fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }

        } if (typeof(records) !== 'undefined' && records.success == false) {
          swal('Error', 'Unable to fetch records. Please try again.', 'error');
          this.no_record_message = 'No records found. ' + records.message;
          this.loading = false;
        }
      }
    );

    this.userGetAllInvalidLoginSubscription = this.userService.userGetAllInvalidLogin.subscribe(
      (records: any) => {
        if (typeof(records) !== 'undefined' && records.success) {
          this._blocked_users = records.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (records.data.length > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $("#viewlist-table").fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }          
        } if (typeof(records) !== 'undefined' && records.success == false) {
          swal('Error', 'Unable to fetch records. Please try again.', 'error');
          this.loading = false;
        }
      }
    );

    this.userPutUnblockSubscription = this.userService.userPutUnblock.subscribe(
      (user: any) => {
        if (typeof(user) !== 'undefined' && user.success) {
          swal({
            position: 'top-end',
            type: 'success',
            title: 'User unblocked.',
            showConfirmButton: false,
            timer: 1500
          });
          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._restore)).remove().draw();

          this.loading = false;
        } else if (typeof(user) !== 'undefined' && user.success === false) {
          swal('Unblock failed', 'Unable to unblock user. <br><br>' + user.message, 'error');
          this.loading = false;
        }
      }
    );
    
  }

  onRefreshRecords() {
    this.loading = true;
    $("#viewlist-table").hide();
    this.userService.httpGetAllUser({login_attempt: 5});
  }

  onShowAllInvalidLogins() {
    this.loading = true;
    $("#viewlist-table").hide();
    this.userService.httpGetAllInvalidLogins();
  }

  onRestoreRecord(id: any, full_name: string, employee_id: string, username: string, photo: string) {
    const that = this;

    swal({
      title: 'Restore disabled user?',
      text: "User can access the site again after this process.",
      html: `User can access the site again after this process.. 
      <br/><br/>
      <img style='float: left: height: 75px; width: 75px; margin-left: 5px;' src='` + this.appConfig.ASSET_ENDPOINT + photo + `'> 
      <div style="">` + full_name +  `<br/>` + `[` + employee_id + `] ` + username + `</div>`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that._restore = id;
        that.userService.httpPostUserUnblock(id);
      }
    });
  }

  ngOnDestroy() {
    this.userGetAllSubscription.unsubscribe();
    this.userPutUnblockSubscription.unsubscribe();
    this.userGetAllInvalidLoginSubscription.unsubscribe();
  }

}

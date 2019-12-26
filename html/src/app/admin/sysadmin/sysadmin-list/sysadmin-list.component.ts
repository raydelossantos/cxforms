import { Component, OnInit, Inject } from '@angular/core';
import { Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import swal from 'sweetalert2';
import { APP_CONFIG } from '../../../app.config';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-sysadmin-list',
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
  templateUrl: './sysadmin-list.component.html',
  styleUrls: ['./sysadmin-list.component.scss']
})
export class SysadminListComponent implements OnInit {

  public loading = false;
  public loading2 = false;
  public loading3 = false;

  datatable:      any;
  _admin_users:   any = [];
  _all_users:     any = []
  _selected_user: any;

  _del_rec:       any = { 
                    _username: '',
                    _user_id: '',
                    _full_name: '',
                    _row_id: ''              
                  };

  no_record_message: string = 'No records found.';

  userAdminGetAllSubscription:  Subscription;
  userGetAllSubscription:       Subscription;

  adminPostSubscription:        Subscription;
  adminDeleteSubscription:      Subscription;
  adminGetSubscription:         Subscription;
  adminPutSubscription:         Subscription;

  _admin_user: any;

  constructor(@Inject (APP_CONFIG) private appConfig,
              private userService: UserService,
              private titleService: Title,) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - System Administrators');
    $('#viewlist-table').hide();
    const $this = this;
    this.userService.httpGetAllAdmin();

    this.loading = true; 

    const params = {
      is_admin: 0
    };

    // this.userService.httpGetAllUser(params);

    this.userGetAllSubscription = this.userService.userGetAll.subscribe(
      (records: any) => {
        if (typeof(records) !== 'undefined' && records.success) {
          records.data.map(
            (record: any) => {
              record.full_name = record.user_info.last_name + ', ' + record.user_info.first_name + ' ' + record.user_info.middle_name + ' (' + record.username + ')';
              return record;
            }
          )
          this._all_users = records.data;
          $('#member_select').prop('disabled', false);
          this.loading2 = false;
        } else if (typeof(records) !== 'undefined' && records.success === false) {
          $('#member_select').prop('disabled', true);
          this.loading2 = false;
        }
      }
    );

    this.userAdminGetAllSubscription = this.userService.adminGetAll.subscribe(
      (records: any) => {
        if (typeof(records) !== 'undefined' && records.success) {
          this._admin_users = records.data;
          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }
          if (records.count > 0 ) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }
        } else if (typeof(records) !== 'undefined' && records.success === false) {
          swal('Error', 'Unable to fetch admin records. <br><br>' + records.message, 'error');
          this.no_record_message = 'No records found. ' + records.message;
          this.loading = false;
        }
      }
    );

    this.adminPostSubscription = this.userService.adminPost.subscribe(
      (admin: any) => {
        if (typeof(admin) !== 'undefined' && admin.success) {
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Successfully created an admin account.',
            showConfirmButton: false,
            timer: 1500
          });

          this.loading = false;
          this.userService.httpGetAllAdmin();
          $('#btnCloseAdd').click();
        } else if (typeof(admin) !== 'undefined' && admin.success === false) {
          swal('Failed creating admin', 'Unable to create admin. <br><br>' + admin.message, 'error');
          this.loading = false;
        }
      }
    );

    this.adminDeleteSubscription = this.userService.adminDelete.subscribe(
      (admin: any) => {
        if (typeof(admin) !== 'undefined' && admin.success) {
          // this.userService.httpGetAllAdmin();

           // delete row from datatable
           const table = $('#viewlist-table').DataTable();
           table.row($('#' + this._del_rec._row_id)).remove().draw();
          
          $('#btnCloseDelete').click();
          
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Succesfully deleted admin account. Admin privileges were also revoked.',
            showConfirmButton: false,
            timer: 1500
          });
        } else if (typeof(admin) !== 'undefined' && admin.success === false) {
          swal('Delete failed', 'Unable to delete admin. <br><br>' + admin.message, 'error');
        }
      }
    );

    this.adminGetSubscription = this.userService.adminGet.subscribe(
      (admin: any) => {
        if (typeof(admin) !== 'undefined' && admin.success) {

          this._admin_user = admin.data;

          $('#lbl_full_name').text(admin.data.user_info.first_name + ' ' + admin.data.user_info.last_name);
          $('#lbl_username').text(admin.data.user_info.username);
          $('#lbl_userid').text(admin.data.user_info.id);
          $('#img_admin').prop('src', this.appConfig.ASSET_ENDPOINT + admin.data.user_info.photo);
          $('#edit_display_name').val(admin.data.privilege.display_name);
          $('input[name=edit_opt_admins][value='+admin.data.privilege.manage_admins+']').prop('checked', true);
          $('input[name=edit_opt_clients][value='+admin.data.privilege.manage_clients+']').prop('checked', true);
          $('input[name=edit_opt_teams][value='+admin.data.privilege.manage_teams+']').prop('checked', true);
          $('input[name=edit_opt_users][value='+admin.data.privilege.manage_users+']').prop('checked', true);
          $('input[name=edit_opt_lob][value='+admin.data.privilege.manage_lob+']').prop('checked', true);
          $('input[name=edit_opt_forms][value='+admin.data.privilege.manage_forms+']').prop('checked', true);

          $("#btnEditRecord").click();
          this.loading3 = false;

        } else if (typeof(admin) !== 'undefined' && admin.success === false) {
          swal('Admin not found', 'Unable to fetch admin account. <br><br>' + admin.message, 'error');
          this.loading3 = false;
        }
      }
    );

    this.adminPutSubscription = this.userService.adminPut.subscribe(
      (admin: any) => {
        if (typeof(admin) !== 'undefined' && admin.success) {

          swal({
            position: 'top-end',
            type: 'success',
            title: 'Admin account was updated!',
            showConfirmButton: false,
            timer: 1500
          });

          this.loading3 = false;
          this.onRefreshRecords();
          $('#btnCloseEdit').click();
        } else if (typeof(admin) !== 'undefined' && admin.success === false) {
          swal('Admin not found', 'Unable to update admin account. <br><br>' + admin.message, 'error');
          this.loading3 = false;
        }
      }
    );

  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.userService.httpGetAllAdmin();
  }

  ngOnDestroy(): void {
    this.userAdminGetAllSubscription.unsubscribe();
    this.userGetAllSubscription.unsubscribe();
  }

  onSaveRecord() {

    if (typeof(this._selected_user) === 'undefined' || this._selected_user === null) {
      swal('Select User', 'You need to select a user first before proceeding.', 'error');
      return;
    }

    const display_name = $('#display_name').val();

    if (display_name.length > 50) {
      swal('Invalid display name', 'Display name should be upto 50 characters only.', 'error');
      return;
    }

    if (display_name.trim() == '') {
      swal('Display name empty', 'You need to supply a display name for this user.', 'error');
      return;
    }

    const new_admin = {

      username: this._selected_user.username,
      user_id: this._selected_user.id,
      display_name:   display_name,
      manage_admins:  $('input[name=opt_admins]:checked').val(),
      manage_clients: $('input[name=opt_clients]:checked').val(),
      manage_teams:   $('input[name=opt_teams]:checked').val(),
      manage_users:   $('input[name=opt_users]:checked').val(),
      manage_lob:     $('input[name=opt_lob]:checked').val(),
      manage_forms:   $('input[name=opt_forms]:checked').val(),

    };

    this.userService.httpPostCreateAdmin(new_admin);
    
  }

  onDeleteRecord(id) {
    this.userService.httpDeleteAdmin(id);
  }

  onDelRecord(username, id, full_name, photo, display_name) {
    this._del_rec = {
      _username: username,
      _user_id: id,
      _full_name: full_name,
      _row_id: id,
      _photo: this.appConfig.ASSET_ENDPOINT + photo
    };
    
    const that = this;

    swal({
      title: 'Delete this admin?',
      text: "This admin will be reverted to regular user access.",
      html: `User can no longer log back in to the system. 
            <br/><br/>
            <img style='float: left: height: 75px; width: 75px; margin-left: 5px;' src='` + this._del_rec._photo + `'> 
            <div style="">` + full_name + `<br/>` + `[` + display_name + `] ` + username + `</div>`,
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete admin!'
    }).then(function(result) {
      if (result.value) {
        that.userService.httpDeleteAdmin(that._del_rec._user_id);
      }
    });
  }

  onEditRecord(id: any) {
    // get details of the selected item from API
    this.userService.httpGetAdminById(id);    
  }

  onUpdateRecord(user_id: any) {
    this.loading3 = true;
    const display_name = $('#edit_display_name').val();

    if (display_name.trim() == '') {
      swal('Display name empty', 'You need to supply a display name for this user.', 'error');
      return;
    }
    
    if (display_name.length > 50 || display_name.length === 0) {
      swal('Invalid display name', 'Display name should be upto 50 characters only.', 'error');
      return;
    }

    const data = {
      display_name:   $("#edit_display_name").val(),
      manage_admins:  $('input[name=edit_opt_admins]:checked').val(),
      manage_clients: $('input[name=edit_opt_clients]:checked').val(),
      manage_teams:   $('input[name=edit_opt_teams]:checked').val(),
      manage_users:   $('input[name=edit_opt_users]:checked').val(),
      manage_lob:     $('input[name=edit_opt_lob]:checked').val(),
      manage_forms:   $('input[name=edit_opt_forms]:checked').val(),
    };

    this.userService.httpPutAdmin(user_id, data);
  }

  onAddRecord() {
    this.loading2 = true;

    const params = {
      is_admin: 0
    };

    this._selected_user = null;
    $('#member_select').prop('disabled', true);
  
    this.userService.httpGetAllUser(params);
  }
  
}

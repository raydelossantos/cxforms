import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { FormService } from '../../../services/form.service';
import swal from 'sweetalert2';
import { Subscription } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { UserService } from '../../../services/user.service';
import { TeamService } from '../../../services/team.service';
import { PermissionService } from '../../../services/permission.service';
import { AuthService } from '../../../services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { GlobalService } from '../../../services/global.service';

@Component({
  selector: 'app-permission',
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
  templateUrl: './permission.component.html',
  styleUrls: ['./permission.component.scss']
})
export class PermissionComponent implements OnInit, OnDestroy, AfterViewInit {

  public loading = false;
  public loading2 = false;
  public loading3 = false;
  public loading4 = false;
  public loading5 = false;
  public loading_team = false;
  public loading_user = false;

  _form_id: any;
  _form_title: any;

  /**
   * for dropdown lists
   */
  _users: any;
  _selected_user: any = [];
  _teams: any;
  _selected_team: any;

  /**
   * for fetched records from DB
   */
  user_permissions : any = [];
  team_permissions : any = [];

  isSaveButtonEnabled: boolean = false;
  formPermissions: any;

  formGetSubscription: Subscription;
  userGetAllNotInForm: Subscription;
  teamGetAllNotInForm: Subscription;

  userPermissionGetAll: Subscription;
  userPermissionPost: Subscription;
  teamPermissionGetAll: Subscription;
  teamPermissionPost: Subscription;
  userPermissionDelete: Subscription;
  trUser: any = null;
  trTeam: any = null;
  teamPermissionDelete: Subscription;
  teamPermissionBatchPut: Subscription;
  userPermissionBatchPut: Subscription;
  formPermissionSubscription: Subscription;

  constructor(private router: Router,
              private globalService: GlobalService,
              private route: ActivatedRoute,
              private userService: UserService,
              private teamService: TeamService,
              private titleService: Title,
              private formService: FormService,
              private authService: AuthService,
              private permissionService: PermissionService) { }

  ngOnInit() {
    const _url = this.router.url.split("/");
    const _form_id = _url[2];
    this._form_id = _form_id;

    const _client = this.globalService.getClientCookie();

    if (_form_id !== 'new') {

      this.formService.httpGetFormPermissionById(this._form_id);

      this.formGetSubscription = this.formService.formGetPermission.subscribe(
        (form: any) => {
          if (typeof(form) !== 'undefined' && form.success) {
            this._form_title = form.data.form_name;
            
            // set page title
            this.titleService.setTitle('Connext Forms - ' + form.data.form_name + ' - Permissions');

          } else if (typeof(form) !== 'undefined' && form.success == false) {
            
            swal('Unauthorized access', 'You are trying to access a resource that either doesn\'t exist or you dont have an access privilege. <br /><br /> You were redirected.', 'warning')

            if (_client) {
              this.router.navigate(['/home/' + _client.id]);
            } else {
              this.router.navigate(['/home']);
            }

          }
        }
      );

      this.userGetAllNotInForm = this.userService.userGetAllNotInForm.subscribe(
        (users: any) => {
          if (typeof(users) !== 'undefined' && users.success) {
            users.data.map(
              (user: any) => {
                user.full_name = user.user_info.last_name + ', ' + user.user_info.first_name + ' ' + user.user_info.middle_name + ' (' + user.username + ')';
                return user;
              }
            )
            this._users = users.data;
            this.loading2 = false;
          } else if (typeof(users) !== 'undefined' && users.success === false) {
            this.loading2 = false;
          }
        }
      );

      this.teamGetAllNotInForm = this.teamService.teamGetAllNotInForm.subscribe(
        (teams: any) => {
          if (typeof(teams) !== 'undefined' && teams.success) {            
            this._teams = teams.data;
            this.loading3 = false;
          } else if (typeof(teams) !== 'undefined' && teams.success === false) {
            this.loading3 = false;
          }
        }
      );

      this.permissionService.httpGetAllTeamPermission({form_id: this._form_id}, this._form_id);
      this.loading4 = true;
      $('#table_team_permissions').fadeOut();

      this.teamPermissionGetAll = this.permissionService.teamPermissionGetAll.subscribe(
        (pTeams: any) => {
          if (typeof(pTeams) !== 'undefined' && pTeams.success) {            
            this.team_permissions = pTeams.data;
            this.loading_team = false;
            if (pTeams.count > 0) {
              $('#table_team_permissions').fadeIn();
              this.isSaveButtonEnabled = true;
            }
          } else if (typeof(pTeams) !== 'undefined' && pTeams.success === false) {
            this.loading_team = false;
            this.team_permissions = [];
          }
        }
      );

      this.permissionService.httpGetAllUserPermission({form_id: this._form_id}, this._form_id);
      this.loading5 = true;
      $('#table_user_permissions').fadeOut();
      
      this.userPermissionGetAll = this.permissionService.userPermissionGetAll.subscribe(
        (pUsers: any) => {
          if (typeof(pUsers) !== 'undefined' && pUsers.success) {            
            this.user_permissions = pUsers.data;
            this.loading_user = false;

            if (pUsers.count > 0) {
              $('#table_user_permissions').fadeIn();
              this.isSaveButtonEnabled = true;
            }
          } else if (typeof(pUsers) !== 'undefined' && pUsers.success === false) {
            this.loading_user = false;
            this.user_permissions = [];
          }
        }
      );

      this.userPermissionPost = this.permissionService.userPermissionPost.subscribe(
        (user: any) => {
          if (typeof(user) !== 'undefined' && user.success) {            
            // swal('Permission added', 'Successfully added new user permission.', 'success');

            swal({
              position: 'top-end',
              type: 'success',
              title: 'User permission added!',
              showConfirmButton: false,
              timer: 1000
            });

            this.resetPermissionForms(); // reset add forms
            $('#btnCloseAddUser').click()
            this.loading = false;
            this.onRefreshUserList();
          } else if (typeof(user) !== 'undefined' && user.success === false) {
            swal('Failed adding permission', 'Unable to save permission. Please try again. <br> <br>' + user.message, 'error' );
            this.loading = false;
          }
        }
      );

      this.teamPermissionPost = this.permissionService.teamPermissionPost.subscribe(
        (team: any) => {
          if (typeof(team) !== 'undefined' && team.success) {            
            // swal('Permission added', 'Successfully added new team permission.', 'success');

            swal({
              position: 'top-end',
              type: 'success',
              title: 'Team permission added!',
              showConfirmButton: false,
              timer: 1000
            });
            
            this.resetPermissionForms(); // reset add forms
            $('#btnCloseAddTeam').click()
            this.loading = false;
            this.onRefreshTeamList();
          } else if (typeof(team) !== 'undefined' && team.success === false) {
            swal('Failed adding permission', 'Unable to save permission. Please try again. <br> <br>' + team.message, 'error' );
            this.loading = false;
          }
        }
      );

      this.userPermissionDelete = this.permissionService.userPermissionDelete.subscribe(
        (user: any) => {
          if (typeof(user) !== 'undefined' && user.success) {  
            $("#trUser_" + this.trUser).fadeOut(300, function () {
              $(this).remove();
            });

            this.trUser = null;
            this.loading = false;
          } else if (typeof(user) !== 'undefined' && user.success === false) {
            swal('Failed delete permission', 'Unable to remove permission. <br> <br>' + user.message, 'error' );
            this.loading = false;
          }
        }
      );

      this.teamPermissionDelete = this.permissionService.teamPermissionDelete.subscribe(
        (team: any) => {
          if (typeof(team) !== 'undefined' && team.success) {  
            $("#trTeam_" + this.trTeam).fadeOut(300, function () {
              $(this).remove();
            });

            this.trTeam = null;
            this.loading = false;
          } else if (typeof(team) !== 'undefined' && team.success === false) {
            swal('Failed delete permission', 'Unable to remove permission. <br> <br>' + team.message, 'error' );
            this.loading = false;
          }
        }
      );

      this.teamPermissionBatchPut = this.permissionService.teamPermissionBatchPut.subscribe(
        (team: any) => {
          if (typeof(team) !== 'undefined' && team.success) {  
            // swal('Updated permission', 'Successfully updated team permissions.', 'success');
            swal({
              position: 'top-end',
              type: 'success',
              title: 'Team permissions updated!',
              showConfirmButton: false,
              timer: 1000
            });

            this.loading_team = false;
          } else if (typeof(team) !== 'undefined' && team.success === false) {
            swal('Failed to update permission', 'Unable to update team permission.<br> <br>' + team.message, 'error' );
            this.loading_team = false;
          }
        }
      );

      this.userPermissionBatchPut = this.permissionService.userPermissionBatchPut.subscribe(
        (user: any) => {
          if (typeof(user) !== 'undefined' && user.success) {  
            // swal('Updated permission', 'Successfully updated user permissions.', 'success');
            swal({
              position: 'top-end',
              type: 'success',
              title: 'User permissions updated!',
              showConfirmButton: false,
              timer: 1000
            });

            this.loading_user = false;
          } else if (typeof(user) !== 'undefined' && user.success === false) {
            swal('Failed to update permission', 'Unable to update user permission.<br> <br>' + user.message, 'error' );
            this.loading_user = false;
          }
        }
      );
    }
  }

  onRefreshTeamList() {
    this.loading_team = true;
    $('#table_team_permissions').fadeOut();
    this.permissionService.httpGetAllTeamPermission({form_id: this._form_id}, this._form_id);
  }

  onRefreshUserList() {
    this.loading_user = true;
    $('#table_user_permissions').fadeOut();
    this.permissionService.httpGetAllUserPermission({form_id: this._form_id}, this._form_id);
  }

  onAddNewUser() {
    this.loading2 = true;
    this.userService.httpGetAllUserNotInForm(this._form_id);
  }

  onAddNewTeam() {
    this.loading3 = true;
    this.teamService.httpGetAllTeamsNotInForm(this._form_id);
  }

  onSaveUserPermission() {
    var data = {};

    if (this._selected_user.length > 0) {
      var user_ids            = [];

      this._selected_user.forEach(user => {
        user_ids.push(user.id);        
      });

      data['user_id']         = user_ids;
      data['form_id']         = this._form_id;
      data['add_record']      = $('#user_add_record').is(':checked') ? 1 : 0;
      data['view_own']        = $('#user_view_own').is(':checked') ? 1 : 0;
      data['view_all']        = $('#user_view_all').is(':checked') ? 1 : 0;
      data['edit_own']        = $('#user_edit_own').is(':checked') ? 1 : 0;
      data['edit_all']        = $('#user_edit_all').is(':checked') ? 1 : 0;
      data['configure_list']  = $('#user_configure_list').is(':checked') ? 1 : 0;
      data['access_control']  = $('#user_access_control').is(':checked') ? 1 : 0;
      data['export_data']     = $('#user_export_data').is(':checked') ? 1 : 0;
      data['created_by']      = this.authService.auth.user.user.id[0];


      this.permissionService.httpPostUserPermission(data, this._form_id);
      this.loading = true;      
    } else {
      swal('No user selected', 'Please select user before proceeding.', 'error');
    }
  }

  onSaveTeamPermission() {
    var data = {};
    if (this._selected_team) {
      data['form_id']         = this._form_id;
      data['team_id']         = this._selected_team.id;
      data['add_record']      = $('#team_add_record').is(':checked') ? 1 : 0;
      data['view_own']        = $('#team_view_own').is(':checked') ? 1 : 0;
      data['view_all']        = $('#team_view_all').is(':checked') ? 1 : 0;
      data['edit_own']        = $('#team_edit_own').is(':checked') ? 1 : 0;
      data['edit_all']        = $('#team_edit_all').is(':checked') ? 1 : 0;
      data['configure_list']  = $('#team_configure_list').is(':checked') ? 1 : 0;
      data['access_control']  = $('#team_access_control').is(':checked') ? 1 : 0;
      data['export_data']     = $('#team_export_data').is(':checked') ? 1 : 0;
      data['created_by']      = this.authService.auth.user.user.id[0];

      this.permissionService.httpPostTeamPermission(data, this._form_id);
      this.loading = true;
    } else {
      swal('No team selected', 'Please select team before proceeding.', 'error');
    }

  }

  resetPermissionForms() {
    $('#user_view_record').prop('checked', true);
    $('#user_view_own').prop('checked', true);
    $('#user_edit_own').prop('checked', true);
    $('#user_view_all').prop('checked', false);
    $('#user_edit_all').prop('checked', false);
    $('#user_configure_list').prop('checked', false);
    $('#user_access_control').prop('checked', false);
    $('#user_export_data').prop('checked', false);

    $('#user_view_own').prop('disabled', false);
    $('#user_edit_own').prop('disabled', false);

    $('#team_add_record').prop('checked', true);
    $('#team_view_own').prop('checked', true);
    $('#team_edit_own').prop('checked', true);
    $('#team_view_all').prop('checked', false);
    $('#team_edit_all').prop('checked', false);
    $('#team_configure_list').prop('checked', false);
    $('#team_access_control').prop('checked', false);
    $('#team_export_data').prop('checked', false);

    $('#team_view_own').prop('disabled', false);
    $('#team_edit_own').prop('disabled', false);

    this._selected_user = null;
    this._selected_team = null;
  }

  onRemoveUserPermission(id: any) {

    const that = this;

    swal({
      title: 'Are you sure?',
      text: "It will permanently be deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.trUser = id;
        that.permissionService.httpDeleteUserPermission(id, that._form_id)
      }
    });

  }

  onRemoveTeamPermission(id: any) {

    const that = this;

    swal({
      title: 'Are you sure?',
      text: "It will permanently be deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.trTeam = id;
        that.permissionService.httpDeleteTeamPermission(id, that._form_id)
      }
    });

  }

  onSaveTeamPermissionBatch() {
    var team_permission: any = [];
    var data: any = [];

    if (this.team_permissions.length > 0) {
      $("#table_team_permissions tbody tr").each(
        function () {
          team_permission.push({
            id:             parseInt($(this).find('.permissionId').text()),
            add_record:     $(this).find('.chkAddRecord').is(':checked') ? 1 : 0,
            view_own:       $(this).find('.chkViewOwn').is(':checked') ? 1 : 0,
            edit_own:       $(this).find('.chkEditOwn').is(':checked') ? 1 : 0,
            view_all:       $(this).find('.chkViewAll').is(':checked') ? 1 : 0,
            edit_all:       $(this).find('.chkEditAll').is(':checked') ? 1 : 0,
            configure_list: $(this).find('.chkConfigureList').is(':checked') ? 1 : 0,
            access_control: $(this).find('.chkAccessControl').is(':checked') ? 1 : 0,
            export_data:    $(this).find('.chkExportData').is(':checked') ? 1 : 0,
          });
        } 
      );
      data['team_permissions'] = team_permission;
      this.loading_team = true;
    }

    if (data) this.permissionService.httpPutTeamPermissionBatch(data['team_permissions'], this._form_id);

  }
  
  onSaveUserPermissionBatch() {
    var user_permission: any = [];
    var data: any = [];

    if (this.user_permissions.length > 0) {
      $("#table_user_permissions tbody tr").each(
        function () {
          user_permission.push({
            id:             parseInt($(this).find('.permissionId').text()),
            add_record:     $(this).find('.chkAddRecord').is(':checked') ? 1 : 0,
            view_own:       $(this).find('.chkViewOwn').is(':checked') ? 1 : 0,
            edit_own:       $(this).find('.chkEditOwn').is(':checked') ? 1 : 0,
            view_all:       $(this).find('.chkViewAll').is(':checked') ? 1 : 0,
            edit_all:       $(this).find('.chkEditAll').is(':checked') ? 1 : 0,
            configure_list: $(this).find('.chkConfigureList').is(':checked') ? 1 : 0,
            access_control: $(this).find('.chkAccessControl').is(':checked') ? 1 : 0,
            export_data:    $(this).find('.chkExportData').is(':checked') ? 1 : 0,
          });
        } 
      );
      data['user_permissions'] = user_permission;
      this.loading_user = true;
    }

    if (data) this.permissionService.httpPutUserPermissionBatch(data['user_permissions'], this._form_id);
  }

  ngOnDestroy() {
    if (this.formGetSubscription) this.formGetSubscription.unsubscribe();
    if (this.userGetAllNotInForm) this.userGetAllNotInForm.unsubscribe();
    if (this.userPermissionGetAll) this.userPermissionGetAll.unsubscribe();
    if (this.userPermissionPost) this.userPermissionPost.unsubscribe();
    if (this.teamPermissionGetAll) this.teamPermissionGetAll.unsubscribe();
    if (this.teamPermissionPost) this.teamPermissionPost.unsubscribe();
    if (this.formPermissionSubscription) this.formPermissionSubscription.unsubscribe();
  }

  ngAfterViewInit() {
    $(document).ready(function() {

      $('#user_view_all').change(function() {
        if ($('#user_view_all').is(':checked')) {
          $('#user_view_own').prop('checked', true);
          $('#user_view_own').prop('disabled', true);
        } else {
          $('#user_view_own').prop('disabled', false);
        }
      });

      $('#user_edit_all').change(function() {
        if ($('#user_edit_all').is(':checked')) {
          $('#user_edit_own').prop('checked', true);
          $('#user_edit_own').prop('disabled', true);
        } else {
          $('#user_edit_own').prop('disabled', false);
        }
      });

      $('#team_view_all').change(function() {
        if ($('#team_view_all').is(':checked')) {
          $('#team_view_own').prop('checked', true);
          $('#team_view_own').prop('disabled', true);
        } else {
          $('#team_view_own').prop('disabled', false);
        }
      });

      $('#team_edit_all').change(function() {
        if ($('#team_edit_all').is(':checked')) {
          $('#team_edit_own').prop('checked', true);
          $('#team_edit_own').prop('disabled', true);
        } else {
          $('#team_edit_own').prop('disabled', false);
        }
      });

    });
  }
  
}

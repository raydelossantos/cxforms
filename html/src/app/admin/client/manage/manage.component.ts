import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ClientService } from '../../../services/client.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { GlobalService } from '../../../services/global.service';
import { APP_CONFIG } from '../../../app.config';
import { Title } from '@angular/platform-browser';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from '../../../services/user.service';
import { TeamService } from '../../../services/team.service';
import { AuthService } from '../../../services/auth.service';
import { LOB } from '../../../models/lob.model';
import { LOBService } from '../../../services/lob.service';

declare var $: any;


@Component({
  selector: 'app-manage',
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
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {

  public loading:                     boolean = false;
  public loading2:                    boolean = false;
  public loading3:                    boolean = false;
  public loading_edit_lob:                    boolean = false;
  public loading_client_admin:        boolean = false;
  public loading_lob_users:           any = [];
  public loading_teams:               boolean = false;
  public loading_lobs:                boolean = false;

  datatable:                          any;
  _clients:                           any = [];
  _client:                            any;
  _api_endpoint:                      string = '';
  _del_rec:                           any = { 
                                        _client_name: '',
                                        _id: 0,
                                        _logo: '/no_img.png'
                                      };
                                    
  clientForm:                         FormGroup;
  selectedFile:                       File = null;
                                    
  _manage_client:                     any = null;
  _selectedUser:                      any = null;
  _users:                             any = [];

  no_record_message:                  string = 'No records found.';

  active_panel:                       any;
  _client_users:                      any = [];
  _lobs:                              any;
  tab_id:                             number = 1;
  _teams:                             any = [];
  client_admin_delete:                any;
  _client_admins:                     any = [];
  _current_lob:                       any = null;
  lob_users:                          any = [];

  clientGetAllSubscription:           Subscription;
  clientGetSubscription:              Subscription;
  clientPostSubscription:             Subscription;
  clientDeleteSubscription:           Subscription;
  clientPutSubscription:              Subscription;
  clientGetFullSubscription:          Subscription;

  userGetAllNotInClientSubscription:  Subscription;
  teamGetAllSubscription:             Subscription;

  clientAdminPostSubscription:        Subscription;
  clientAdminDeleteSubscription:      Subscription;
  clientAdminGetSubscription:         Subscription;
  clientAdminPutSubscription:         Subscription;  
  
  userGetAllNotInLobSubscription:     Subscription;

  lobUserGetSubscription:             Subscription;
  lobUserPostSubscription:            Subscription;
  lobUserDeleteSubscription:          Subscription;
  lobUserPutSubscription:             Subscription;

  lobPostSubscription:                Subscription;
  lobGetAllSubscription:              Subscription;
  lobDeleteSubscription:              Subscription;
  lobPutSubscription: Subscription;
  lobGetSubscription: Subscription;
  _lob: any;

  constructor(private clientService:  ClientService,
              private globalService:  GlobalService,
              private lobService:     LOBService,
              private userService:    UserService,
              private teamService:    TeamService,
              private router:         Router,
              private route:          ActivatedRoute,
              private titleService:   Title,
              private authService:    AuthService,
              @Inject (APP_CONFIG) private appConfig) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Manage Clients');
    const $this = this;
    this._api_endpoint = this.appConfig.API_ENDPOINT;
    // this.clientService.httpGetAllClient();
    this.loading = true;
    $('#viewlist-table').hide();

    this.route.params.subscribe(
      (params: Params) => {
        this.active_panel = params['id'];

        if (Number(params['id'])) {
          this.loading = true;
          this.clientService.httpGetClientFull(params['id']);    
        } else {
          this.router.navigate(['/admin/']);
        }
        
      }
    );

    this.teamGetAllSubscription = this.teamService.teamGetAll.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {
          this._teams = teams.data;
          this.loading_teams = false;
        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
          // swal('Error', 'Unable to fetch team records. <br><br>' + teams.message, 'error');
          // this.no_record_message = 'No records found. ' + teams.message;
          this.loading_teams = false;
        }
      }
    );

    this.clientGetSubscription = this.clientService.clientGet.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {
          this._manage_client = client.data;
        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to fetch client', 'Unable to fetch client. <br><br>' + client.message, 'error');
        }
      }
    );

    this.clientGetFullSubscription = this.clientService.clientGetFull.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {

          // get all client details and split to multiple parts of the modal form
          this._manage_client = client.data;

          // CLIENT ADMINS
          this._client_admins = client.data.user;

          // LOB USERS PERMISSIONS
          this._lobs          = client.data.lob_user;

          client.data.lob_user.forEach(lob => {
            this.lob_users[lob.id] = {
              id: lob.id,
              lob_name: lob.lob_name,
              user: lob.user
            };

            this.loading_lob_users[lob.id] = false;
          });

          this.teamService.httpGetAllTeams({client_id: this._manage_client.id});
          this.loading = false;

        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Failed to fetch client', 'Unable to fetch client. <br><br>' + client.message, 'error');

        }
      }
    );

    this.clientPutSubscription = this.clientService.clientPut.subscribe(
      (client: any) => {
        if (typeof(client) !== 'undefined' && client.success) {
          swal('Client updated', 'Client has been update successfully.', 'success');

          this.clientService.httpGetClient(this._manage_client.id);

          $('#btnCloseEditClient').click();
        } else if (typeof(client) !== 'undefined' && client.success === false) {
          swal('Updated failed', 'Unable to update client information. <br><br>' + client.message, 'error');
        }
      }
    )

    this.clientGetAllSubscription = this.clientService.clientGetAll.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this._clients = clients.data;
          this.loading_edit_lob = false;
          // $('#edit_lob_client').val(this._current_lob.client_id);

        } else if (typeof(clients) !== 'undefined' && clients.success === false) {
          this.loading_edit_lob = false;
        }
      }
    );

    this.userGetAllNotInClientSubscription = this.userService.userGetAllNotInClient.subscribe(
      (users: any) => {
        if (typeof(users) !== 'undefined' && users.success) {
          users.data.map(
            (record: any) => {
              record.full_name = record.user_info.last_name + ', ' + record.user_info.first_name + ' ' + record.user_info.middle_name + ' (' + record.username + ')';
              return record;
            }
          )

          this._users = users.data;
          this.loading3 = false;
        } else if (typeof(users) !== 'undefined' && users.success === false) {
          // do nothing
          swal('Error', 'Unable to fetch user records. <br><br>' + users.message, 'error');
          this.loading3 = false;
        }
      }
    );

    this.userGetAllNotInLobSubscription = this.userService.userGetAllNotInLob.subscribe(
      (users: any) => {
        if (typeof(users) !== 'undefined' && users.success) {
          users.data.map(
            (record: any) => {
              record.full_name = record.user_info.last_name + ', ' + record.user_info.first_name + ' ' + record.user_info.middle_name + ' (' + record.username + ')';
              return record;
            }
          )
          this._users = users.data;
          this.loading3 = false;
        } else if (typeof(users) !== 'undefined' && users.success === false) {
          // do nothing
          swal('Error', 'Unable to fetch user records. <br><br>' + users.message, 'error');
          this.loading3 = false;
        }
      }
    );

    this.clientAdminPostSubscription = this.clientService.clientAdminPost.subscribe(
      (client_admin: any) => {
        if (typeof(client_admin) !== 'undefined' && client_admin.success) {
          swal('Client Admin created', 'Successfully added client admin.', 'success');
          this.loading2 = false;
          this._selectedUser = null;
          $('#btnCloseClientAdminAdd').click();
          this.onRefreshClientAdmin();
        } else if (typeof(client_admin) !== 'undefined' && client_admin.success === false) {
          swal('Create failed', 'Unable to create client admin. <br><br>' + client_admin.message, 'error');
          this.loading2 = false;
        }
      }
    );

    this.clientAdminDeleteSubscription = this.clientService.clientAdminDelete.subscribe(
      (client_admin: any) => {
        if (typeof(client_admin) !== 'undefined' && client_admin.success) {
          swal('Deleted!', 'Successfully deleted client admin.', 'success');
          this.loading_client_admin = false;
          $('#tr_client_admin_' + this.client_admin_delete).fadeOut();
          this.onRefreshClientAdmin();
        } else if (typeof(client_admin) !== 'undefined' && client_admin.success === false) {
          swal('Delete failed', 'Unable to delete client admin. <br><br>' + client_admin.message, 'error');
          this.loading_client_admin = false;
        }
      }
    );

    this.clientAdminPutSubscription = this.clientService.clientAdminBatchPut.subscribe(
      (client_admin: any) => {
        if (typeof(client_admin) !== 'undefined' && client_admin.success) {
          this.loading_client_admin = false;
        } else if (typeof(client_admin) !== 'undefined' && client_admin.success === false) {
          swal('Update failed', 'Unable to update client admin permissions. <br><br>' + client_admin.message, 'error');
          this.loading_client_admin = false;
        }
      }
    );

    this.clientAdminGetSubscription = this.clientService.clientAdminGet.subscribe(
      (client_admin: any) => {
        if (typeof(client_admin) !== 'undefined' && client_admin.success) {
          this.loading_client_admin = false
          this._client_admins = client_admin.data;
        } else if (typeof(client_admin) !== 'undefined' && client_admin.success === false) {
          swal('Fetch failed', 'Unable to fetch client admins for this client. <br><br>' + client_admin.message, 'error');
          this.loading_client_admin = false;
        }
      }
    );

    /** LOB USERS SUBSCRIPTIONS */

    this.lobUserGetSubscription = this.clientService.lobUserGet.subscribe(
      (lob_users: any) => {
        if (typeof(lob_users) !== 'undefined' && lob_users.success) {
          this.loading_lob_users[lob_users.lob_id] = false;
          this.lob_users[this._current_lob.id].user = lob_users.data;
        } else if (typeof(lob_users) !== 'undefined' && lob_users.success === false) {
          swal('Fetch failed', 'Unable to fetch LOB User. <br><br>' + lob_users.message, 'error');
          // this.loading_client_admin = false;
        }
      }
    );

    this.lobGetAllSubscription = this.lobService.lobUserGet.subscribe(
      (lobs: any) => {
        if (typeof(lobs) !== 'undefined' && lobs.success) {

          // LOB USERS PERMISSIONS
          this._lobs = lobs.data;

          lobs.data.forEach(lob => {
            this.lob_users[lob.id] = {
              id: lob.id,
              lob_name: lob.lob_name,
              user: lob.user
            };

            this.loading_lob_users[lob.id] = false;
          });

          this.loading_lobs = false;

        } else if (typeof(lobs) !== 'undefined' && lobs.success === false) {
          swal('Fetch failed', 'Unable to fetch LOB User. <br><br>' + lobs.message, 'error');
          // this.loading_client_admin = false;
        }
      }
    );

    this.lobUserPostSubscription = this.clientService.lobUserPost.subscribe(
      (lob_users: any) => {
        if (typeof(lob_users) !== 'undefined' && lob_users.success) {
          // this.loading_client_admin = false
          // this.lob_users[this._current_lob.lob_id] = lob_users.data;
          swal('Success', 'Line of Business user has been added successfully.', 'success');
          this.onRefreshLobPermission(this._current_lob);
          $('#btnCloseLobUserAdd').click();
        } else if (typeof(lob_users) !== 'undefined' && lob_users.success === false) {
          swal('Fetch failed', 'Unable to create new LOB User. <br><br>' + lob_users.message, 'error');
          // this.loading_client_admin = false;
        }
      }
    );

    this.lobGetSubscription = this.lobService.lobGet.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          this._lob = lob.data;

          $('#edit_lob_name').val(lob.data.lob_name);
          $('#edit_lob_description').val(lob.data.description);

          $('#btnEditLobRecord').click();

        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Error', 'Unable to fetch line of business. <br><br>' + lob.message, 'error');
        }
      }
    )
    
    this.lobPutSubscription = this.lobService.lobPut.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('Updated record', 'Successfully updated line of business.', 'success');
          $('#btnCloseEditLob').click();
          this.onRefreshLobRecords();
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Update failed', 'Unable to update line of business. <br><br>' + lob.message, 'error');
        }
      }
    );

    this.lobUserDeleteSubscription = this.clientService.lobUserDelete.subscribe(
      (lob_user: any) => {
        if (typeof(lob_user) !== 'undefined' && lob_user.success) {
          swal('Success', 'Line of Business User has been deleted successfully.', 'success');
          this.onRefreshLobPermission(this._current_lob);
        } else if (typeof(lob_user) !== 'undefined' && lob_user.success === false) {
          swal('Delete failed', 'Unable to delete LOB User. <br><br>' + lob_user.message, 'error');
          // this.loading_client_admin = false;
        }
      }
    );

    this.lobUserPutSubscription = this.clientService.lobUserBatchPut.subscribe(
      (lob_user: any) => {
        if (typeof(lob_user) !== 'undefined' && lob_user.success) {
          this.loading_lob_users[lob_user.lob_id] = false;
          // swal('Success', 'Line of Business Users has been updated successfully.', 'success');
          // this.loading_client_admin = false;
        } else if (typeof(lob_user) !== 'undefined' && lob_user.success === false) {
          swal('Update failed', 'Unable to update LOB Users permissions. <br><br>' + lob_user.message, 'error');
          this.loading_lob_users[lob_user.lob_id] = false;
          this.onRefreshLobPermission(this._current_lob);
        }
      }
    );

    this.lobPostSubscription = this.lobService.lobPost.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('LOB created', 'Successfully created a new line of business.', 'success');
          $('#btnCloseAddLob').click();
          $('#description').val('');
          $('#lob_name').val('');
          this.onRefreshLobRecords();
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Create failed', 'Unable to create line of business. <br><br>' + lob.message, 'error');
        }
      }
    );

    this.lobDeleteSubscription = this.lobService.lobDelete.subscribe(
      (lob: any) => {
        if (typeof(lob) !== 'undefined' && lob.success) {
          swal('LOB created', 'Successfully deleted line of business.', 'success');
          this.onRefreshLobRecords();
        } else if (typeof(lob) !== 'undefined' && lob.success === false) {
          swal('Delete failed', 'Unable to delete line of business. <br><br>' + lob.message, 'error');
        }
      }
    )
    
  }

  /** CLIENT MAINTENANCE */
  onEditClientInfo() {

    const client = this._manage_client;

    $('#edit_img_client').attr('src', this._api_endpoint + client.logo);

    $('#edit_id').val(client.id);
    $('#edit_client_name').val(client.client_name);
    $('#edit_description').val(client.description);
    if (client.creator) {
      $('#edit_created_by').val(client.creator.first_name + ' ' + client.creator.last_name);
    } else {
      $('#edit_created_by').val('-');
    }
    $('#edit_created_at').val(client.created_at);
    $('#edit_modified_at').val(client.updated_at);

  }

  onUpdateClientInfo() {

    const fd = new FormData();
    
    fd.append('client_name', $('#edit_client_name').val());
    fd.append('description', $('#edit_description').val());
    
    if (this.selectedFile) {
      fd.append('logo', this.selectedFile, this.selectedFile.name)
    }

    this.clientService.httpPutClient(this._manage_client.id, fd);

  }
  
  /** CLIENT ADMIN MANAGEMENT */

  onClientManage(client_id: any) {
    // this.globalService.setClientCookie(client);
    // this.router.navigate(['/home'])
    this.clientService.httpGetClientFull(client_id);
    $('#viewlist-client-user').hide();
  }

  onDeleteClientAdmin(id: any) {
    const that = this;

    swal({
      title: 'Delete Client Admin?',
      text: "It will permanently deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.client_admin_delete = id;
        that.clientService.httpDeleteClientAdmin(id);
      }
    });

  }

  onAddClientAdmin() {
    this.loading3 = true;
    this._selectedUser = null;
    this.userService.httpGetAllUserNotInClient(this._manage_client.id);
  }

  onSaveClientAdmin() {
    if (this._selectedUser) {

      this.loading2 = true;
      var client_admin: any = [];

      client_admin = {
        user_id:      this._selectedUser.id,
        client_id:    this._manage_client.id,
        manage_info:  $('#chkManageInfo').is(':checked') ? 1 : 0,
        manage_lob:   $('#chkManageLOB').is(':checked') ? 1 : 0,
        manage_forms: $('#chkManageForms').is(':checked') ? 1 : 0,
        created_by:   this.authService.auth.user.user.id
      };

      this.clientService.httpPostClientAdmin(client_admin);
    }
  }

  onRefreshClientAdmin() {
    this.loading_client_admin = true;
    this.clientService.httpGetClientAdmin({client_id: this._manage_client.id});
  }

  onSaveClientAdminBatch() {
    var client_admins: any = [];

    if (this._client_admins.length !== 0) {
      $("#table_client_admin tbody tr").each(
        function () {
          client_admins.push({
            id:             parseInt($(this).find('.clientAdminId').text()),
            manage_info:    $(this).find('.chkManageInfo').is(':checked') ? 1 : 0,
            manage_lob:     $(this).find('.chkManageLOB').is(':checked') ? 1 : 0,
            manage_forms:   $(this).find('.chkManageForms').is(':checked') ? 1 : 0,
          });
        } 
      );
      this.loading_client_admin = true;

      if (client_admins) this.clientService.httpPutClientAdminBatch(client_admins, this._manage_client.id);
    } 

  }


  /** LOB MANAGEMENT */

  onSaveLobRecord() {
    var _lob: any = [];

    if (this._manage_client) {

      _lob = {
        lob_name: $('#lob_name').val(),
        client_id: this._manage_client.id,
        description: $('#description').val(),
        created_by: this.globalService.authService.auth.user.user.id
      };

    }

    this.lobService.httpPostLOB(_lob);
  }

  onUpdateRecord(id: any) {
    const data = {
      lob_name:       $('#edit_lob_name').val(),
      description:    $('#edit_lob_description').val(),
    };
    this.lobService.httpPutLOB(id, data);
  }

  onEditLobRecord(lob_id: any) {
    this.loading_edit_lob = true;
    // this._current_lob = lob;

    // get details of the selected item from API
    this.lobService.httpGetLOBById(lob_id);
  }

  onArchiveLob(lob: any) {
    const that = this;

    if (lob.client_id == this._manage_client.id) {

      swal({
        title: 'Are you sure?',
        text: "Line of business will be archived!",
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, archive it!'
      }).then(function(result) {
        if (result.value) {
          that.loading_lobs = true;
          that.lobService.httpDeleteLOB(lob.id);
        }
      });
      
    } else {
      swal('Delete failed', 'You are deleting a line of business that does not belong to this client.', 'error');
    }
  }

  onAddLobUserPermission(lob: any) {
    this._selectedUser = null;
    this._current_lob = lob;

    this.loading3 = true;
    this.userService.httpGetAllUserNotInLob(this._current_lob.id);
  }

  onSaveLobUser() {
    if (this._selectedUser) {

      // this.loading2 = true;
      var lob_user: any = [];

      lob_user = {
        user_id:        this._selectedUser.id,
        lob_id:         this._current_lob.id,
        manage_forms:   $('#chkLobManageForms').is(':checked') ? 1 : 0,
        add_form:       $('#chkAddNewForm').is(':checked') ? 1 : 0,
        created_by:     this.authService.auth.user.user.id
      };

      this.clientService.httpPostLobUser(lob_user);
    }
  }

  onSaveLobUserBatchPermission(lob: any) {
    var lob_users: any = [];

    if (this.lob_users[lob.id].user.length !== 0) {
      this.loading_lob_users[lob.id] = true;
      $("#table_lob_users_" + lob.id + " tbody tr").each(
        function () {
          lob_users.push({
            id:               parseInt($(this).find('.lobUserId').text()),
            manage_forms:     $(this).find('.chkLobManageForms').is(':checked') ? 1 : 0,
            add_form:         $(this).find('.chkLobAddNewForm').is(':checked') ? 1 : 0,
          });
        } 
      );
      this.clientService.httpPutLobUserBatch(lob_users, lob.id);
    }

  }

  onRefreshLobRecords() {
    this.loading_lobs = true;
    this.lobService.httpGetLOBUserByClientId(this._manage_client.id);
  }

  onRefreshLobPermission(lob: any) {
    this.loading_lob_users[lob.id] = true;
    this._current_lob = lob;
    this.clientService.httpGetLobUser({lob_id: lob.id});
  }

  onDeleteLobUser(id: any, lob: any) {
    this._current_lob = lob;
    const that = this;

    swal({
      title: 'Are you sure?',
      text: "It will permanently deleted!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then(function(result) {
      if (result.value) {
        that.clientService.httpDeleteLobUser(id);
      }
    });

  }

  /** TEAM MANAGEMENT */

  onFileSelected(event) {

    if (event.target.files.length == 0) {
      return;
    }

    if (event.target.files[0].type == 'image/jpeg' || event.target.files[0].type == 'image/png' || event.target.files[0].type == 'image/gif') {
      this.selectedFile = event.target.files[0];
    } else {
      swal('Invalid file type', 'You have selected a non-supported file type. Please choose JPEG, GIF or PNG.', 'error');
      event.target.value = null;
    }

  }

  onRefreshTeamList() {
    this.loading_teams = true;
    this.teamService.httpGetAllTeams({client_id: this._manage_client.id});
  }

  toggleTab(tab_id: number) {
    if (tab_id === 1 && this.tab_id !== 1) {
      this.tab_id = 1;
      $('#client-admin-tab').addClass('active');
      $('#client-admin-tab').addClass('show');
      $('#lob-tab').removeClass('active');
      $('#lob-tab').removeClass('show');
      $('#team-tab').removeClass('active');
      $('#team-tab').removeClass('show');
    } else if (tab_id === 2 && this.tab_id !== 2) {
      this.tab_id = 2;
      $('#client-admin-tab').removeClass('active');
      $('#client-admin-tab').removeClass('show');
      $('#lob-tab').addClass('active');
      $('#lob-tab').addClass('show');
      $('#team-tab').removeClass('active');
      $('#team-tab').removeClass('show');
    } else if (tab_id === 3 && this.tab_id !== 3) {
      this.tab_id = 3;
      $('#client-admin-tab').removeClass('active');
      $('#client-admin-tab').removeClass('show');
      $('#lob-tab').removeClass('active');
      $('#lob-tab').removeClass('show');
      $('#team-tab').addClass('active');
      $('#team-tab').addClass('show');
    }
  }
  
  ngOnDestroy() {
    if (this.clientGetAllSubscription)            this.clientGetAllSubscription.unsubscribe();
    if (this.clientGetSubscription)               this.clientGetSubscription.unsubscribe();
    if (this.clientPostSubscription)              this.clientPostSubscription.unsubscribe();
    if (this.clientDeleteSubscription)            this.clientDeleteSubscription.unsubscribe();
    if (this.clientPutSubscription)               this.clientPutSubscription.unsubscribe();
    if (this.clientGetFullSubscription)           this.clientGetFullSubscription.unsubscribe();
    if (this.userGetAllNotInClientSubscription)   this.userGetAllNotInClientSubscription.unsubscribe();
    if (this.teamGetAllSubscription)              this.teamGetAllSubscription.unsubscribe();
    if (this.clientAdminPostSubscription)         this.clientAdminPostSubscription.unsubscribe();
    if (this.clientAdminDeleteSubscription)       this.clientAdminDeleteSubscription.unsubscribe();
    if (this.clientAdminGetSubscription)          this.clientAdminGetSubscription.unsubscribe();
    if (this.clientAdminPutSubscription  )        this.clientAdminPutSubscription  .unsubscribe();
    if (this.userGetAllNotInLobSubscription)      this.userGetAllNotInLobSubscription.unsubscribe();
    if (this.lobUserGetSubscription)              this.lobUserGetSubscription.unsubscribe();
    if (this.lobUserPostSubscription)             this.lobUserPostSubscription.unsubscribe();
    if (this.lobUserDeleteSubscription)           this.lobUserDeleteSubscription.unsubscribe();
  }

}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TeamService } from '../../../services/team.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ClientService } from '../../../services/client.service';
import { GlobalService } from '../../../services/global.service';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-team-list',
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
  templateUrl: './team-list.component.html',
  styleUrls: ['./team-list.component.scss']
})
export class TeamListComponent implements OnInit, OnDestroy {

  public loading = false;

  datatable: any;
  _teams: any = [];
  _team: any = [];
  _clients: any = [];
  selectedClient: any = null;

  _del_rec = {
    _team_id: '',
    _team_name: '',
    _team_location: '',
    _team_code: ''
  };

  no_record_message: string = 'No records found.';

  teamGetAllSubscription:     Subscription;
  teamPostSubscription:       Subscription;
  teamDeleteSubscription:     Subscription;
  clientGetAllSubscription:   Subscription;
  teamGetSubscription:        Subscription;
  teamPutSubscription:        Subscription;
  
  teamForm: FormGroup;

  constructor(private teamService: TeamService,
              private clientService: ClientService,
              private titleService: Title,
              private globalService: GlobalService) { }

  ngOnInit() {
    // set page title
    this.titleService.setTitle('Connext Forms - Manage Teams');
    $('#viewlist-table').hide();
    const $this = this;

    this.teamService.httpGetAllTeams();
    this.clientService.httpGetAllClient();
        
    this.loading = true;

    this.teamGetAllSubscription = this.teamService.teamGetAll.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {

          this._teams = teams.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (teams.count > 0) {
            $('#viewlist-table').fadeOut();
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
            }, 500);
          } else {
            this.loading = false;
          }

        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
          swal('Error', 'Unable to fetch team records. <br><br>' + teams.message, 'error');
          this.no_record_message = 'No records found. ' + teams.message;
          this.loading = false;
        }
      }
    );

    this.clientGetAllSubscription = this.clientService.clientGetAll.subscribe(
      (clients: any) => {
        if (typeof(clients) !== 'undefined' && clients.success) {
          this._clients = clients.data;
          this.loading = false;
        } else if (typeof(clients) !== 'undefined' && clients.success === false) {
          swal('Error', 'Unable to fetch client records. <br><br>' + clients.message, 'error');
          this.loading = false;
        }
      }
    );

    this.teamPostSubscription = this.teamService.teamPost.subscribe(
      (team: any) => {
        if (typeof(team) !== 'undefined' && team.success) {
          swal('Created new team', 'New team was created successfully', 'success');
          this.teamService.httpGetAllTeams();
          $('#btnCloseAdd').click();
          this.selectedClient = null;
          this.resetFields('add');
        } else if(typeof(team) !== 'undefined') {
          swal('Create failed', 'Unable to create team.  <br><br>' + team.message, 'error');
        }
      }
    )

    this.teamDeleteSubscription = this.teamService.teamDelete.subscribe(
      (team: any) => {
        if (typeof(team) !== 'undefined' && team.success) {
          swal('Deleted team', 'Successfully deleted the team record.', 'success');
          $('#btnCloseDelete').click();

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._team_id)).remove().draw();

        } else if(typeof(team) !== 'undefined') {
          swal('Delete failed', 'Unable to delete team.  <br><br>' + team.message, 'error');
        }
      }
    );

    this.teamPutSubscription = this.teamService.teamPut.subscribe(
      (team: any) => {
        if (typeof(team) !== 'undefined' && team.success) {
          swal('Updated new team', 'Successfully created a new team record.', 'success');
          this.teamService.httpGetAllTeams();
          $('#btnCloseEdit').click();
          this.selectedClient = null;
          this.resetFields('edit');
        } else if (typeof(team) !== 'undefined' && team.success === false) {
          swal('Update failed', 'Unable to update team.  <br><br>' + team.message, 'error');
        }
      }
    )

    this.teamGetSubscription = this.teamService.teamGet.subscribe(
      (team: any) => {
        if (typeof(team) !== 'undefined' && team.success) {
          this._team = team.data;
          if (team.data.client !== null) {
            // $('#edit_client_id').val(team.data.client.client_name);
            this.selectedClient = team.data.client;
          } else {
            // $('#edit_client_id').prop('selectedIndex', -1);
          }
          $('#edit_team_name').val(team.data.team_name);
          $('#edit_team_code').val(team.data.team_code);
          $('#edit_description').val(team.data.description);
          $('#edit_location').val(team.data.location);
          $("#btnEditRecord").click();
        } else if (typeof(team) !== 'undefined' && team.success === false) {
          swal('Fetch failed', 'Unable to fetch record. <br><br>' + team.message, 'error');
        }
      }
    );

    this.initTeamForm();

  }

  initTeamForm() {
    const team_name = '';
    const team_code = '';
    const location = '';
    const description = '';

    this.teamForm = new FormGroup({
      'team_name': new FormControl(team_name, Validators.required),
      'team_code': new FormControl(team_code, Validators.required),
      'location': new FormControl(location, Validators.required),
      'description': new FormControl(description, Validators.required)
    });
  }

  onSaveRecord() {
    let formValues = this.teamForm.value;

    formValues['created_by'] = this.globalService.authService.auth.user.user.id;
    formValues['client_id'] =  (this.selectedClient) ? this.selectedClient.id : 0;
    // $('#add_client_id').val();
    // (this.selectedClient) ? this.selectedClient.id : 0;

    if (this.teamForm.valid) {
      this.teamService.httpPostTeam(formValues);
    } else {
      swal('Missing fields', 'Please check all required fields.', 'error');
    }    
  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.teamService.httpGetAllTeams(); 
  }

  onEditRecord(id: any) {
    // get details of the selected item from API
    this.teamService.httpGetTeamById(id);    
    this.selectedClient = null;
  }

  onUpdateRecord(id: any) {

    const data = {
      client_id:      (this.selectedClient) ? this.selectedClient.id : 0,
      team_name:      $('#edit_team_name').val(),
      team_code:      $('#edit_team_code').val(),
      location:       $('#edit_location').val(),
      description:    $('#edit_descreiption').val()
    };

    this.teamService.httpPutTeam(id, data);
  }

  onDelRecord(id, name, code, location) {

    this._del_rec = {
      _team_id: id ,
      _team_name: name,
      _team_location: location,
      _team_code: code
    };
    
    $("#btnDeleteRecord").click();
  }

  onDeleteRecord(id) {
    this.teamService.httpDeleteTeam(id);
  }

  resetFields(method: any) {
    if (method === 'add') {
      $('#team_name').val('');
      $('#team_code').val('');
      $('#description').val('');
      $('#location').val('');
    } else {
      $('#edit_team_name').val();
      $('#edit_team_code').val();
      $('#edit_location').val();
      $('#edit_descreiption').val();
    }

    this.selectedClient = null;
  }

  ngOnDestroy() {
    this.clientGetAllSubscription.unsubscribe();
    this.teamGetAllSubscription.unsubscribe();
    this.teamPostSubscription.unsubscribe();
  }

}

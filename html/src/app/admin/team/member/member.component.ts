import { Component, OnInit, OnDestroy } from '@angular/core';
import swal from 'sweetalert2';
import { TeamService } from '../../../services/team.service';
import { Subscription } from 'rxjs';
import { MemberService } from '../../../services/member.service';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-member',
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
  templateUrl: './member.component.html',
  styleUrls: ['./member.component.scss']
})
export class MemberComponent implements OnInit, OnDestroy {

  public loading = false;
  public loading2 = false;

  datatable: any;
  _members: any = [];
  _teams: any = [];
  _users: any = [];

  _selectedUsers: any = [];
  _selectedTeam:  any = null;

  _del_rec:       any = {
                    _userid: '',
                    _username: '',
                    _full_name: '',
                    _team_name: ''
                  };

  no_record_message: string = 'No records found.';

  teamGetAllSubscription:           Subscription;
  memberGetAllSusbscription:        Subscription;
  memberPostSusbscription:          Subscription;
  memberGetAllUsersSusbscription:   Subscription;
  memberDeleteSusbscription:         Subscription;

  constructor(private teamService: TeamService,
              private memberService: MemberService,
              private titleService: Title,) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Manage Team Members');
    $('#viewlist-table').hide();

    const $this = this;
    this.teamService.httpGetAllTeams();

    this.teamGetAllSubscription = this.teamService.teamGetAll.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {
          this._teams = teams.data;
        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
          swal('Error', 'Unable to fetch team records. <br><br>' + teams.message, 'error');
          this.no_record_message = 'No records found. ' + teams.message;
        }
      }
    );

    this.memberGetAllSusbscription = this.memberService.memberGetAll.subscribe(
      (members: any) => {
        if (typeof(members) !== 'undefined' && members.success) {
          this._members = members.data;

          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          $('#viewlist-table').hide();

          if (members.count > 0) {
              setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              this.loading = false;
              $('#viewlist-table').fadeIn();
              }, 500);
          } else {
            this.loading = false;
          }
        } else if (typeof(members) !== 'undefined' && members.success === false) {
          swal('Error', 'Unable to fetch team member records. <br><br>' + members.message, 'error');
          this.loading = false;
        }
      }
    );

    this.memberPostSusbscription = this.memberService.memberPost.subscribe(
      (member: any) => {

        if (typeof(member) !== 'undefined' && member.success) {
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Successfully added team member(s) to the team.',
            showConfirmButton: false,
            timer: 1500
          });
          
          this.memberService.httpGetAllMembers({team_id: this._selectedTeam.id});
          this.memberService.httpGetAllMembersNotInTeam({team_id: this._selectedTeam.id});

        } else if (typeof(member) !== 'undefined' && member.success === false) {
          swal('Create failed', 'Unable to add team member(s). <br><br>' + member.message, 'error');
        }
      }
    );

    this.memberDeleteSusbscription = this.memberService.memberDelete.subscribe(
      (member: any) => {
        if (typeof(member) !== 'undefined' && member.success) {
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Team member deleted.',
            showConfirmButton: false,
            timer: 1500
          });

          this.memberService.httpGetAllMembersNotInTeam({team_id: this._selectedTeam.id});

          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this._del_rec._id)).remove().draw();

          this.loading = false;

        } else if (typeof(member) !== 'undefined' && member.success === false) {
          swal('Delete failed', 'Unable to delete team member. <br><br>' + member.message, 'error');
        }
      }
    );

    this.memberGetAllUsersSusbscription = this.memberService.memberGetAllUsers.subscribe(
      (users: any) => {
        if (typeof(users) !== 'undefined' && users.success) {
          users.data.map(
            (record: any) => {
              record.full_name = record.user_info.last_name + ', ' + record.user_info.first_name + ' ' + record.user_info.middle_name + ' (' + record.username + ')';
              return record;
            }
          )
          this._users = users.data;
          this.loading2 = false;
        } else if (typeof(users) !== 'undefined' && users.success === false) {
          swal('Error', 'Unable to fetch team members. <br><br>' + users.message, 'error');
          this.loading2 = false;
        }
      }
    );
  }

  selectAll() {
    this._selectedUsers = this._users;
  }

  unselectAll() {
      this._selectedUsers = [];
  }

  onSelectChange() {
    if (this._selectedTeam) {
      this.loading = true;
      $('#viewlist-table').hide();
      this.memberService.httpGetAllMembers({team_id: this._selectedTeam.id});
      this.memberService.httpGetAllMembersNotInTeam({team_id: this._selectedTeam.id});
    }
  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.memberService.httpGetAllMembers({team_id: this._selectedTeam.id});
    this.memberService.httpGetAllMembersNotInTeam({team_id: this._selectedTeam.id});
  }

  onSaveRecord() {
    if (this._selectedUsers.length > 0) {
      var team_members = [];
      this._selectedUsers.forEach(user => {
        team_members.push(user.id);
      });
      const data = {
        team_id: this._selectedTeam.id,
        team_members: team_members
      };
      this.memberService.httpPostMember(data);
    } else {
      swal('No user selected', 'Please select user(s) to add.', 'error');
    }
    this._selectedUsers = [];
  }

  onDelRecord(id:any, username: any, user_id: any, first_name: any, last_name: any) {
    this._del_rec = {
      _id: id,
      _userid: user_id,
      _username: username,
      _full_name: first_name + ' '  + last_name,
      _team_name: this._selectedTeam.team_name
    };

    $("#btnDeleteRecord").click();
  }

  onDeleteRecord(id: any) {
    this.loading = true;
    this.memberService.httpDeleteMember(id);
  }

  ngOnDestroy() {
    this.teamGetAllSubscription.unsubscribe()
    this.memberGetAllSusbscription.unsubscribe()
    this.memberPostSusbscription.unsubscribe()
    this.memberGetAllUsersSusbscription.unsubscribe()
    this.memberDeleteSusbscription.unsubscribe()
  }

  onShowAddMember(team_id: any) {
    this.loading2 = true;
    this.memberService.httpGetAllMembersNotInTeam({team_id: this._selectedTeam.id});
  }

}

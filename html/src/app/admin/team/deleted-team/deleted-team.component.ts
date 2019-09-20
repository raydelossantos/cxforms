import { Component, OnInit, OnDestroy } from '@angular/core';
import { TeamService } from '../../../services/team.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

declare var $: any;

@Component({
  selector: 'app-deleted-team',
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
  templateUrl: './deleted-team.component.html',
  styleUrls: ['./deleted-team.component.scss']
})
export class DeletedTeamComponent implements OnInit, OnDestroy {

  public loading = false;

  datatable: any;
  _teams: any = [];

  no_record_message: string = 'No records found.';

  teamGetAllDeletedSusbcription: Subscription;
  teamPostRestoreSusbcription:   Subscription;
  restore_id: string;

  constructor(private teamService: TeamService,
              private titleService: Title) { }

  ngOnInit() {

    // set page title
    this.titleService.setTitle('Connext Forms - Archived Teams');
    $('#viewlist-table').hide();

    const $this = this;
    this.teamService.httpGetAllDeletedTeams();
    this.loading = true;

    this.teamGetAllDeletedSusbcription = this.teamService.teamGetAllDeleted.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {
          this._teams = teams.data;
          $('#viewlist-table').hide();
          if ( $.fn.dataTable.isDataTable('#viewlist-table') ) {
            $("#viewlist-table").dataTable().fnDestroy();
          }

          if (teams.data.length > 0) {
            setTimeout(() => {
              $this.datatable = $('#viewlist-table').dataTable();
              $('#viewlist-table').fadeIn();
              this.loading = false;
            }, 500);
          } else {
            this.loading = false;
          }
        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
          swal('Error', 'Unable to fetch archived team records. <br><br>' + teams.message, 'error');
          this.no_record_message = 'No records found. ' + teams.message;
          this.loading = false;
        }
      }
    );

    this.teamPostRestoreSusbcription = this.teamService.teamPostRestore.subscribe(
      (team: any) => {
        if (typeof(team) !== 'undefined' && team.success) {
          swal({
            position: 'top-end',
            type: 'success',
            title: 'Team restored.',
            showConfirmButton: false,
            timer: 1500
          });
          // delete row from datatable
          const table = $('#viewlist-table').DataTable();
          table.row($('#' + this.restore_id)).remove().draw();

          this.loading = false;

        } else if (typeof(team) !== 'undefined' && team.success === false) {
          swal('Failed restore', 'Unable to restore team. <br><br>' + team.message, 'error');
        }
      }
    );

  }

  onRefreshRecords() {
    this.loading = true;
    $('#viewlist-table').hide();
    this.teamService.httpGetAllDeletedTeams();  
  }
  
  onRestoreRecord(id: any) {
    const that = this;

    swal({
      title: 'Restore archived line of business?',
      text: "It will be listed back to active LOB's.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, restore it!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.restore_id = id;
        that.teamService.httpPostTeamRestore(id);
      }
    });
  }

  ngOnDestroy() {
    this.teamGetAllDeletedSusbcription.unsubscribe();
    this.teamPostRestoreSusbcription.unsubscribe();
  }

}

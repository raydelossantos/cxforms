import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { Subscription } from 'rxjs';
import swal from 'sweetalert2';
import { Title } from '@angular/platform-browser';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-sync',
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
  templateUrl: './sync.component.html',
  styleUrls: ['./sync.component.scss']
})
export class SyncComponent implements OnInit, OnDestroy {

  public loading = false;
  userSyncSubscription = new Subscription;

  constructor(private userService: UserService,
              private titleService: Title,) { }

  ngOnInit() {
    // set page title
    this.titleService.setTitle('Connext Forms - Sync User Accounts');

    this.userSyncSubscription = this.userService.userPostSync.subscribe(
      (sync: any) => {
        if (typeof(sync) !== 'undefined' && sync.success) {
          this.loading = false;
          swal('User Sync Done', 'Successfully synced user records from API.', 'success');
        } else if (typeof(sync) !== 'undefined' && sync.success === false) {
          this.loading = false;
          swal(
            'Failed to Sync Users',
            'Something went wrong while trying to sync users. Error below. <br > <br >' +  sync.message,
            'error');
        }
      }
    );
  }

  onSyncUsers() {
    const $this = this;
    this.loading = true;
    // $this.userService.httpPostSyncUser();
    
    // swal({
    //   text: 'Synching users from CS API....',
    //   type: "info",
    //   allowOutsideClick: false,
    //   onOpen: () => {
    //     swal.showLoading();
    //   }
    // });

  }


  ngOnDestroy() {
    this.userSyncSubscription.unsubscribe();
  }
}

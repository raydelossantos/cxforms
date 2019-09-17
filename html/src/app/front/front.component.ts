import { Component, OnInit, Inject, AfterViewInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { APP_CONFIG } from '../app.config';
import { TeamService } from '../services/team.service';
import { Subscription, Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-front',
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
  templateUrl: './front.component.html',
  styleUrls: ['./front.component.scss']
})
export class FrontComponent implements OnInit, AfterViewInit, OnDestroy {
  
  public loading = false; 
  public loading2 = false; 

  username:      string = '';
  user_id:       string = '';
  is_admin:      boolean = false;
  first_name:    string = '';
  last_name:     string = '';
  middle_name:   string = '';
  avatar:        string = '';
  employee_id:   string = '';
  email:         string = '';
  notifications: any    = [];

  teams:         any    = [];
  current_id:    any;
  unread_count:  number = 0;

  teamsGetAllUserSubscription:  Subscription;
  notificationGetAllSubscription:Subscription;
  notificationDeleteSubscription: Subscription;
  notificationMarkReadSubscription: Subscription;
  notificationMarkAllReadSubscription: Subscription;
  notificationDeleteAllSubscription: Subscription;

  constructor(@Inject(APP_CONFIG) private appConfig,
              private teamService: TeamService,
              private authService: AuthService,
              private notificationService: NotificationService,
              private router: Router) { }

  ngOnInit() {
    this.authService.getAuthCookie();

    // Set user info to display
    this.username = this.authService.auth.user.user.username;
    this.user_id = this.authService.auth.user.user.id;
    this.is_admin = this.authService.auth.user.user.is_admin;
    this.first_name = this.authService.auth.user.user_info.first_name;
    this.last_name = this.authService.auth.user.user_info.last_name;
    this.middle_name = this.authService.auth.user.user_info.middle_name;
    this.employee_id = this.authService.auth.user.user_info.employee_id;
    this.email = this.authService.auth.user.user_info.email;
    
    this.avatar = this.appConfig.ASSET_ENDPOINT + this.username;

    this.teamService.httpGetAllTeamsByUserId(parseInt(this.user_id));

    this.teamsGetAllUserSubscription = this.teamService.teamGetAllByUserId.subscribe(
      (teams: any) => {
        if (typeof(teams) !== 'undefined' && teams.success) {
          this.teams = teams.data;
        } else if (typeof(teams) !== 'undefined' && teams.success === false) {
          // unable to get team data, do nothing. :)
        }
      }
    );

    this.notificationService.httpGetAllNotification({ user_id: this.user_id });

    this.notificationGetAllSubscription = this.notificationService.notificationGetAll.subscribe(
      (notifs: any) => {
        if (typeof(notifs) !== 'undefined' && notifs.success) {
          this.notifications = notifs.data;

          // count unread notifs
          var unread_count = 0;
          notifs.data.forEach(not => {
            if (not.is_opened === 0) {
              unread_count++;
            }
          });

          this.unread_count = unread_count;

          this.loading2 = false;
        } else if (typeof(notifs) !== 'undefined' && notifs.success === false) {
          // unable to get team data, do nothing. :)
        }
      }
    );

    this.notificationDeleteSubscription = this.notificationService.notificationDelete.subscribe(
      (notif: any) => {
        if (typeof(notif) !== 'undefined' && notif.success) {
          $('#notif_' + this.current_id).fadeOut();
          this.refreshNotifications();
        } else {
          // unable to delete, do nothing
        }
      }
    );

    this.notificationMarkReadSubscription = this.notificationService.notificationPut.subscribe(
      (notif: any) => {
        if (typeof(notif) !== 'undefined' && notif.success) {
          $('#notif_btn_' + this.current_id).fadeOut();
          $('#notif_' + this.current_id).removeClass('unread');
          this.refreshNotifications();
        } else {
          // unable to delete, do nothing
        }
      }
    );

    this.notificationMarkAllReadSubscription = this.notificationService.notificationPutMarkAll.subscribe(
      (notif: any) => {
        if (typeof(notif) !== 'undefined' && notif.success) {
          this.refreshNotifications();
        } else {
          // unable to delete, do nothing
        }
      }
    );

    this.notificationDeleteAllSubscription = this.notificationService.notificationDeleteAll.subscribe(
      (notif: any) => {
        if (typeof(notif) !== 'undefined' && notif.success) {
          this.refreshNotifications();
        } else {
          // unable to delete, do nothing
        }
      }
    );

    /**
     * This function gets user notification automatically every 5minutes
     */
    Observable
    .interval(5*60*1000)        // every 5mintues, get notifications
    .timeInterval()
    .subscribe(
      ( ) => {
        if (this.authService.auth) {
          this.notificationService.httpGetAllNotification({ user_id: this.user_id });
        }
      }
    );

  }

  refreshNotifications() {
    this.loading2 = true;
    this.notificationService.httpGetAllNotification({ user_id: this.user_id });
  }

  onMarkAllAsRead() {
    this.loading2 = true;
    this.notificationService.httpMarkAllReadNotification(parseInt(this.user_id));
  }

  onClearAllNotifs() {
    this.loading2 = true;
    this.notificationService.httpDeleteAllNotification(parseInt(this.user_id));
  }

  onMarkAsRead(id: any) {
    this.current_id = id;
    this.notificationService.httpMarkAsReadNotification(id, parseInt(this.user_id));    
  }

  onDeleteNotif(id: any) {
    this.current_id = id;
    this.notificationService.httpDeleteNotification(id, parseInt(this.user_id));
  }

  logout() {

    this.loading = true; 

    let $this = this;
    this.authService.deleteAuthCookie();

    setTimeout(function () {
      $this.router.navigate(['/login']);
      this.loading = false; 
    }, 1000);

  }

  toggleSidebar() {

    if ($('.sidebar').hasClass('is_toggle') || $('.sidebar').css('margin-left') == '-270px') {
      /** set sidebar to visible */
      $('.sidebar').css('margin-left', '0');
      $('.sidebar').removeClass('is_toggle');
      /** set the main content to move contents to right */
      $('.main-router').removeClass('is_toggle');
      /** change the logo font-awesome to X */
    } else {
      /** set the sidebar to be hidden */
      $('.sidebar').css('margin-left', '-270px');
      $('.sidebar').addClass('is_toggle');
      /** set the main content to move contents to the left */
      $('.main-router').addClass('is_toggle');
    }

  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    if (this.teamsGetAllUserSubscription) this.teamsGetAllUserSubscription.unsubscribe();
    if (this.notificationGetAllSubscription) this.notificationGetAllSubscription.unsubscribe();
    if (this.notificationDeleteSubscription) this.notificationDeleteSubscription.unsubscribe();
    if (this.notificationMarkReadSubscription) this.notificationMarkReadSubscription.unsubscribe();
    if (this.notificationMarkAllReadSubscription) this.notificationMarkAllReadSubscription.unsubscribe();
    if (this.notificationDeleteAllSubscription) this.notificationDeleteAllSubscription.unsubscribe();
  }

}

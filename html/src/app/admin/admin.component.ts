import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';
import { timeout } from 'rxjs/operators';
import { APP_CONFIG } from '../app.config';
import { Subscription, Observable } from 'rxjs';
import { TeamService } from '../services/team.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, AfterViewInit {

  public loading = false;
  public loading2 = false; 

  app_version: '0.0.1';

  username:      string = '';
  user_id:       string = '';
  is_admin:      boolean = false;
  first_name:    string = '';
  last_name:     string = '';
  middle_name:   string = '';
  avatar:        string = '';
  employee_id:   string = '';
  email:         string = '';

  teams:          any   = [];

  current_id:    any;
  notifications: any    = [];
  unread_count:  number = 0;

  teamsGetAllUserSubscription: Subscription;
  notificationGetAll:           Subscription;
  notificationDeleteSubscription: Subscription;
  notificationMarkReadSubscription: Subscription;
  notificationMarkAllReadSubscription: Subscription;
  notificationDeleteAllSubscription: Subscription;

  constructor(@Inject(APP_CONFIG) private appConfig,
              private teamService: TeamService,
              private notificationService: NotificationService,
              private authService: AuthService,
              private router: Router) { }

  ngOnInit() {
    this.authService.getAuthCookie();
    this.is_admin = this.authService.auth.user.user.is_admin;
    this.app_version = this.appConfig.APP_VERSION;

    if (!this.is_admin) {
      swal('Access Denied!', 'You are not allowed to access this area. <br /><br /> If you believe this is an error, kindly contact Administrator.', 'error');
      this.router.navigate(['/home']);
      return;
    }

    // Set user info to display
    this.username = this.authService.auth.user.user.username;
    this.user_id = this.authService.auth.user.user.id;
    this.is_admin = this.authService.auth.user.user.is_admin;
    this.first_name = this.authService.auth.user.user_info.first_name;
    this.last_name = this.authService.auth.user.user_info.last_name;
    this.middle_name = this.authService.auth.user.user_info.middle_name;
    this.employee_id = this.authService.auth.user.user_info.employee_id;
    this.email = this.authService.auth.user.user_info.email;

    this.avatar = this.appConfig.ASSET_ENDPOINT + this.username + '-PHOTO.jpg';

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

    this.notificationGetAll = this.notificationService.notificationGetAll.subscribe(
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
    const that = this;

    swal({
      title: 'Clear notifications?',
      text: "Removes all notifications. This proccess cannot be undone.",
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, clear all!'
    }).then(function(result) {
      if (result.value) {
        that.loading2 = true;
        that.notificationService.httpDeleteAllNotification(parseInt(this.user_id));
      }
    });
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
    const that = this;

    swal({
      title: 'Logout?',
      text: "All current sessions will be deleted. Login will be required afterwards.",
      type: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, log me out!'
    }).then(function(result) {
      if (result.value) {
        that.loading = true;
        that.authService.deleteAuthCookie();

        setTimeout(function () {
          that.router.navigate(['/login']);
          that.loading = false; 
        }, 1000);
      }
    });
  }


  toggleSidebar() {

    if ($('.sidebar').hasClass('is_toggle')) {
      $('.sidebar').css('margin-left', '0');
      $('.sidebar').removeClass('is_toggle');
    } else {
      $('.sidebar').css('margin-left', '-270px');
      $('.sidebar').addClass('is_toggle');
    }
    
    if ($('.main-router').hasClass('is_toggle')) {
      $('.main-router').removeClass('is_toggle');
    } else {
      $('.main-router').addClass('is_toggle');
    }
  }

  ngAfterViewInit() {


  }

}

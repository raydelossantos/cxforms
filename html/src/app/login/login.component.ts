import { Component, OnInit, OnDestroy, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Title } from '@angular/platform-browser';

import { LoginService } from '../services/login.service';
import swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';
import { APP_CONFIG } from '../app.config';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  // encapsulation: ViewEncapsulation.None
})
export class LoginComponent implements OnInit, OnDestroy {

  public loading    = false;

  username              : string;
  password              : string;
  username_class        : any;
  password_class        : any;
  resetUsername_class   : any;
  loginForm             : FormGroup;
  resetForm             : FormGroup;
  
  loginSubscription     : Subscription;
  resetSubscription     : Subscription;

  GOOGLE_LOGIN_URL  : string    = '';
  return            : string    = '';
  invalid_login     : string    = '';

  constructor(@Inject(APP_CONFIG) private appConfig,
              private loginService: LoginService,
              private authService: AuthService,
              private router: Router,
              private route: ActivatedRoute,
              private titleService: Title) {
  }

  ngOnInit() {
    const $this = this;
    this.titleService.setTitle('Connext Forms - Login');

    this.GOOGLE_LOGIN_URL = 'https://accounts.google.com/o/oauth2/v2/auth?scope=' 
                              + encodeURI('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/plus.me') 
                              + '&redirect_uri=' + encodeURI(this.appConfig.CLIENT_REDIRECT_URL)
                              + '&response_type=code&client_id=' + this.appConfig.CLIENT_ID 
                              + '&access_type=online';

    // check if user has login information saved on browser
    this.authService.getAuthCookie();

    if (this.authService.auth) {
      this.router.navigate(['/home']);
    }

    this.route.queryParams.subscribe(
      (params: any) => {
        this.return = params['return'] ? params['return'] : '';

        this.invalid_login = params['success'] ? params['success'] : '';
    });

    this.loginSubscription = this.loginService.LDapAuthLogin.subscribe(
      (auth: any) => {
        if (typeof(auth) !== 'undefined' && auth.success) {
          this.authService.setAuthCookie(auth.token, auth.expires);
          if (this.return !== '') {
            // redirect to a page
            $this.router.navigateByUrl(this.return);
            // unset redirect cookie
            this.authService.unsetRedirectCookie();
            this.return = '';
          } else {
            $this.router.navigate(['/home']);
          }
          this.loading = false;
        } else if (typeof(auth) !== 'undefined' && auth.success === false) {
          swal(auth.status, auth.message, 'error');
          this.loading = false;
        } else if (typeof(auth) !== 'undefined' && auth.length !== 0) {
          swal('Connection error', 'Connext Forms seems to be having a trouble connecting to the server. <br/> Kindly report to administrator if persists.', 'error');
          this.loading = false;
        }
      }
    );

    this.initLoginForm();

    this.resetSubscription = this.loginService.ResetPassword.subscribe(
      (reset: any) => {
        if (typeof(reset) !== 'undefined' && reset.success) {
          swal('Password reset request successful!', 'Please check your email for instrcutions to reset your password.', 'success');
        } else if (typeof(reset) !== 'undefined' && reset.success === false) {
          swal('Password reset request error', 'Something went wrong while requesting for password reset. <br/><br/>' + reset.message, 'error');
        }
      }
    );
    
  }

  initLoginForm() {
    const username = '';
    const password = '';

    this.loginForm = new FormGroup({
      'username': new FormControl(username, Validators.required),
      'password': new FormControl(password, [Validators.required, Validators.minLength(4)])
    });
  }

  // ajaxRequest() {

  //   Swal.fire({
  //     title: 'Submit your Github username',
  //     input: 'text',
  //     inputAttributes: {
  //       autocapitalize: 'off'
  //     },
  //     showCancelButton: true,
  //     confirmButtonText: 'Look up',
  //     showLoaderOnConfirm: true,
  //     preConfirm: (login) => {
  //       return fetch(`//api.github.com/users/${login}`)
  //         .then(response => {
  //           if (!response.ok) {
  //             throw new Error(response.statusText)
  //           }
  //           return response.json()
  //         })
  //         .catch(error => {
  //           Swal.showValidationMessage(
  //             `Request failed: ${error}`
  //           )
  //         })
  //     },
  //     allowOutsideClick: () => !Swal.isLoading()
  //   }).then((result) => {
  //     if (result.value) {
  //       Swal.fire({
  //         title: `${result.value.login}'s avatar`,
  //         imageUrl: result.value.avatar_url
  //       })
  //     }
  //   })
  // }

  onLogin() {

    const loginValues = this.loginForm.value;

    if (this.loginForm.valid) {
      this.loading = true;
      this.loginService.httpPostLdapLogin(loginValues);
    }
  }

  onGoogleLogin() {
    this.loading = true;
    document.location.href = this.GOOGLE_LOGIN_URL;
  }

  ngOnDestroy() {
    this.loginSubscription.unsubscribe();
  }

  /**
   * For UI Display of textfields
   */
  isTextEmpty() {
    if (!this.loginForm.controls.username.valid) {
      this.username_class = {'has-val': false};
    } else {
      this.username_class = {'has-val': true};
    }

    if (!this.loginForm.controls.password.valid) {
      this.password_class = {'has-val': false};
    } else {
      this.password_class = {'has-val': true};
    }
    if (!this.resetForm.controls.resetUsername.valid) {
      this.resetUsername_class = {'has-val': false};
    } else {
      this.resetUsername_class = {'has-val': true};
    }
  }


  onResetPassword() {


    const username: any = $('#resetUsername').val();
    const fd = new FormData();
     fd.append('username', username);
     
     if (!this.validateEmail(username)) {
      swal('Invalid email', 'Email is incorrect.', 'error');
      return;
    } else {
      this.loginService.httpPostForgotPassword(fd);
    }

  
  }

  onShowPassword() {
    if ($('#password').prop('type') === 'password') {
      $('#password').prop('type', 'text');
      $('#showPassword').removeClass('fa-eye');
      $('#showPassword').addClass('fa-eye-slash');
    } else {
      $('#password').prop('type', 'password')
      $('#showPassword').removeClass('fa-eye-slash');
      $('#showPassword').addClass('fa-eye');
    }
  }

  lostAccessSwal() {
    // swal(
    //   "Lost Access",
    //   "Please send an email to <a href='mailto:john.l@connext.solutions'>john.l@connext.solutions</a> <br> or chat via Skype <a href='skype:johnmichaeltlagman?chat'>@johnnmichaeltlagman</a>.",
    //   "info");


    // swal({
    //   title: 'Enter your email address',
    //   html:
    //     '<input id="swal-input1" placeholder="Employee number" id="empId" class="swal2-input">' +
    //     '<input id="swal-input2" placeholder="Username" id="username" class="swal2-input">',
    //   preConfirm: function () {
    //     return new Promise(function (resolve) {
    //       resolve([
    //         $('#username').val(),
    //         // $('#swal-input2').val()
    //       ])
    //     })
    //   },
    //   onOpen: function () {
    //     $('#swal-input1').focus()
    //   }
    // }).then(function (result) {
    //   swal(JSON.stringify(result))
    // }).catch(swal.noop)


    swal({

      title: 'Enter your email address.',
      input: 'text',
      // html: '<input id="swal-input1" placeholder="Employee ID" class="swal2-input">',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Reset now',
      showLoaderOnConfirm: true,
      preConfirm: (email: any) => {
        return fetch(this.appConfig.API_ENDPOINT + '/auth/forgot/' + email)
          .then(response => {
            if (!response.ok) {
              throw new Error(response.statusText)
            }
            return response.json()
          })
          .catch(error => {
            swal.showValidationMessage(
              `Request failed: ${error}`
            )
          })
      },
      allowOutsideClick: () => !swal.isLoading()
    }).then((result) => {
      if (result.value) {
        swal(
          'Password reset request successful.',
          'Check your email for further instructions',
          'success'
        )
      }
    });

  // }
  
  validateEmail(email): boolean {
    const regExp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return regExp.test(email.trim());
  }

}

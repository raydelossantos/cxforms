import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
// import { FormGroup, FormControl, Validators } from '@angular/forms';
// import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
// import { Title } from '@angular/platform-browser';

import { LoginService } from '../services/login.service';
import swal from 'sweetalert2';
// import { AuthService } from '../services/auth.service';
import { APP_CONFIG } from '../app.config';
import { ActivatedRoute, Params, Router } from '@angular/router';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})

export class ResetComponent implements  OnInit, OnDestroy {

  public loading    = false;
  // subscription      : Subscription;

  url: string        = '';
  hash: string       = '';
  username: string   = '';

  constructor(@Inject(APP_CONFIG) private appConfig,
              private loginService: LoginService,
              private router: Router,
              private route: ActivatedRoute) {  }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {

        this.url = this.router.url;

        this.username = params['username'];
        this.hash = params['hash'];
      }
    );
    
    /** TODO 
     * Add resetPassword subscription here
     * 
    */
  }

  onResetPass() {
    const password: any = $('#password').val();
    const vpassword: any = $('#vpassword').val();

    const fd = new FormData();

     fd.append('password', password);
     fd.append('vpassword', vpassword);

    this.loginService.httpPostResetPassword(fd, this.username, this.hash);
    swal('Password Reset Done!');
    this.loading = false;
  }

  ngOnDestroy() {
    
  }

}

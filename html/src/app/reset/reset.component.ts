import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LoginService } from '../services/login.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.scss']
})
export class ResetComponent implements OnInit {

 public loading: boolean = false;
  
  username: any = '';
  hash: any;
  message: any = '';
  image: any = '';

  unblockLoginGetSubscription: Subscription;
  unblocking_done: boolean = false;
  status: boolean;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private loginService: LoginService) { }

  ngOnInit() {

    this.loading = true;

    this.route.params.subscribe(
      (params: Params) => {

        this.username   = params['username'];
        this.hash       = params['hash'];
        this.loading = true;

        this.loginService.httpGetUnblockLogin(this.username, this.hash);
      }
    );

    this.unblockLoginGetSubscription = this.loginService.LDapAuthUnblockLogin.subscribe(
      (unblock: any) => {
        if (typeof(unblock) !== 'undefined' && unblock.success) {
          this.unblocking_done = true;
          this.status = true;
          this.image = '../../assets/success.png';
          this.message = unblock.message;
          this.loading = false;
        } else if (typeof(unblock) !== 'undefined' && unblock.success === false) {
          this.unblocking_done = true;
          this.status = false;
          this.image = '../../assets/error.png';
          this.message = unblock.message;
          this.loading = false;
        }
      }
    );


  }


}

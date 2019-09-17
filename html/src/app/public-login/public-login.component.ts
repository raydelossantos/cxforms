import { Component, OnInit } from '@angular/core';
import { Router, Params, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { FormService } from '../services/form.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-public-login',
  templateUrl: './public-login.component.html',
  styleUrls: ['./public-login.component.scss']
})
export class PublicLoginComponent implements OnInit {

  public loading: boolean =  true; 
  formGetSubscription: Subscription;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService,
              private formService: FormService) { }

  ngOnInit() {
    let $this = this;
    let auth: any = [];

    this.route.params.subscribe(
      (params: Params) => {
        auth.hash = params['hash'];
        auth.token = params['jwt'];
        auth.expires = params['exp'];

        this.authService.setAuthCookiePublic(auth.token, auth.expires, auth.hash);
        
        this.formService.httpGetFormByHash(params['hash']);
      }
    );

    this.formGetSubscription = this.formService.formGet.subscribe(
      (form: any) => {
        if (typeof(form) !== 'undefined' && form.success) {
          setTimeout(function () {
            $this.router.navigate(['/public/form/' + form.data.id + '/' + form.data.hash]);
          }, 3000);
        } else {
          this.authService
        }
      }
    )
  }

}

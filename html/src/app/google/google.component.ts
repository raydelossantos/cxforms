import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import swal from 'sweetalert2';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-google',
  templateUrl: './google.component.html',
  styleUrls: ['./google.component.scss']
})
export class GoogleComponent implements OnInit {

  constructor(private route: ActivatedRoute, 
              private router: Router,
              private authService: AuthService) { }

  ngOnInit() {
    let $this = this;
    let auth: any = [];

    this.route.params.subscribe(
      (params: Params) => {

        auth.token = params['jwt'];
        auth.expires = params['exp'];

        this.authService.setAuthCookie(auth.token, auth.expires);

        if (this.authService.getRedirectCookie() !== '') {

          // redirect to a page
          $this.router.navigateByUrl(this.authService.getRedirectCookie());

          this.authService.unsetRedirectCookie();

        } else {

          $this.router.navigate(['/home']);

        }

      }
    );

  }

}

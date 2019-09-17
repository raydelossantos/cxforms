import { HttpHandler, HttpInterceptor, HttpRequest, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Injectable, Injector } from '@angular/core';

import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import swal from 'sweetalert2';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
    constructor(private inj: Injector,
                private authService: AuthService,
                private router: Router) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

      const auth = this.inj.get(AuthService);
      
      // check request if has public in url, set bearer to public token
      if (this.getUrlPath(req.url) === 'public') {
        const authTokenPublic = auth.getTokenPublic();

        const expiration = parseInt(auth.getExpirationPublic());
        const current_time = new Date().getTime() / 1000;
    
        if (current_time > expiration) {
          // expired token
          this.authService.deleteAuthCookiePublic();
          this.router.navigate(['/public/error']);
          
          swal({
            position: 'top-end',
            type: 'info',
            title: 'Session has expired.',
          })

          return next.handle(req);
        }
        
        const newReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + authTokenPublic),
        });

        return next.handle(newReq);          
      }
      
      const authToken = auth.getToken();

      const expiration = parseInt(auth.getExpiration());
      const current_time = new Date().getTime() / 1000;
  
      if (current_time > expiration) {
        // expired token
        this.authService.deleteAuthCookie();
        this.router.navigate(['/login']);
        // swal('Login expired', 'You were redirected to login page.', 'info');
        swal.close();

        return next.handle(req);
      }

      if (typeof authToken !== 'undefined' && authToken !== null) {
        const newReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer ' + authToken),
        });

        return next.handle(newReq);
      }

      return next.handle(req);
    }

    getUrlPath(urlString: string) {
      var url = document.createElement('a');
      url.href = urlString;

      var path = url.pathname.split('/');

      return path[1];
    }
}

import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { Injectable, Inject } from '@angular/core';

@Injectable()
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService,
              private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    
    if (this.authService.checkAuthCookie()) {
      
      const expiration = parseInt(this.authService.getExpiration());
      const current_time = new Date().getTime() / 1000;

      if (current_time > expiration) {
        // expired token
        this.authService.deleteAuthCookie();
        this.router.navigate(['/login']);

      }

      this.authService.getAuthCookie();

      return true;
    }

    this.authService.deleteAuthCookie();

    // set redirect_url in case user logs in using google account
    this.authService.setRedirectCookie(state.url);
    
    this.router.navigate(['/login'], {
      queryParams: {
        return: state.url
        }
      }
    );
    return false;
  }
}

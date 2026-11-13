import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate():
    | Observable<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.authService.currentUser$.pipe(
      map(user => {
        if (!user?.token) {
          return this.router.createUrlTree(['/login']);
        }
        if (user.role !== 'Admin') {
          return this.router.createUrlTree([
            user.role === 'Provider' ? '/provider' : '/dashboard'
          ]);
        }
        return true;
      })
    );
  }
}

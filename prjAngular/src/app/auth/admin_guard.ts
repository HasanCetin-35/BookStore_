import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AuthService } from './auth.service'; 

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getUserByToken().pipe(
      map(user => {
        console.log("SOOOOOOOOOOOOOOOON",user);
        if (user && Array.isArray(user.roles) && user.roles.includes('Admin')) {
          return true; // Admin erişim izni
        } else {
          return this.router.createUrlTree(['/unauthorized']); // Yetkisiz erişim
        }
      }),
      catchError(err => {
        console.error('Error fetching user info:', err);
        return of(this.router.createUrlTree(['/login'])); // Hata durumunda login sayfasına yönlendir
      })
    );
  }
}

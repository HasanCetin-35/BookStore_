import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';
  // Kullanıcı ve rollerle ilgili API servisiniz

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
   
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    return this.authService.getUserByToken().pipe(
      switchMap(user => {
        // Eğer kullanıcı yoksa, login sayfasına yönlendir
        if (!user) {
          this.router.navigate(['/login']);
          return [false];
        }

       
        return this.authService.getUserRoles(user.id).pipe(
          map(roles => {
            const requiredRoles: string[] = route.data['roles'];

            if (requiredRoles && requiredRoles.some(role => roles.includes(role))) {
              return true;
            } else {
              this.router.navigate(['/unauthorized']);
              return false;
            }
          })
        );
      })
    );
  }
}

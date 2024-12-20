import { Injectable } from '@angular/core';
import {
    CanActivate,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    Router,
    UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class UserGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
        return this.authService.getUserByToken().pipe(
            map(user => {
                
                if (user && Array.isArray(user.roles) && user.roles.includes('user')) {
                    console.log(".........................", user.roles);
                    return true; // Kullanıcı erişim izni
                } else {
                    return this.router.createUrlTree(['/unauthorized']); // Yetkisiz erişim
                }
            }),
            catchError(err => {
                console.error('Error fetching user info:', err);
                // Hata durumunda UrlTree'yi bir Observable içinde döndürün
                return of(this.router.createUrlTree(['/login'])); // Hata durumunda login sayfasına yönlendir
            })
        );
    }
}

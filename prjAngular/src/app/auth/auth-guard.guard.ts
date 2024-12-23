import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.authService.getUserByToken().subscribe(
        user => {
          if (!user) {
            // Kullanıcı yoksa login sayfasına yönlendir
            this.router.navigate(['/login']);
            resolve(false);
            return;
          }

          // Kullanıcı rol kontrolü
          const requiredRoles: string[] = route.data['roles'] || [];
          if (requiredRoles.length && !requiredRoles.some(role => user.roles.includes(role))) {
            this.router.navigate(['/unauthorized']);
            resolve(false);
            return;
          }

          // Kullanıcı izin kontrolü
          const requiredPermissions: string[] = route.data['permissions'] || [];
          if (requiredPermissions.length) {
            this.authService.getUserPermissions(user.id).subscribe(
              permissions => {
                const hasPermission = requiredPermissions.some(permission =>
                  permissions.includes(permission)
                );
                if (hasPermission) {
                  resolve(true);  // Erişim izni ver
                } else {
                  this.router.navigate(['/unauthorized']);
                  resolve(false);
                }
              },
              () => {
                this.router.navigate(['/unauthorized']);
                resolve(false);
              }
            );
          } else {
            // Rol ve izin kontrolü geçildiyse erişim izni ver
            resolve(true);
          }
        },
        () => {
          // Eğer kullanıcı verisi alınamazsa login sayfasına yönlendir
          this.router.navigate(['/login']);
          resolve(false);
        }
      );
    });
  }
}

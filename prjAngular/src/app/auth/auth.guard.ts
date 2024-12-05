import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';  // AuthService'i import ediyoruz
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {
    console.log("OLuşturuldu")
  }

  canActivate(): Observable<boolean> | boolean {
    // Kullanıcı bilgilerini AuthService'den alıyoruz
    console.log("Ben authGuardım")
    return this.authService.getUserByToken().pipe(
      map(user => {
        console.log("bilgiler",user)
        if (user && user.role === 'Admin') {
          // Eğer kullanıcı admin ise, true döndür ve sayfaya gitmesine izin ver
          return true;
        } else if (user && user.role === 'user') {
          // Eğer kullanıcı normal bir kullanıcı ise, false döndür ama başka bir sayfaya yönlendir
          return true;
        } else {
          // Eğer kullanıcı login değilse veya yetkili değilse login sayfasına yönlendir
          this.router.navigate(['/login']);
          return false;
        }
      }),
      catchError((error) => {
        // Herhangi bir hata olursa login sayfasına yönlendir ve false döndür
        this.router.navigate(['/login']);
        return new Observable<boolean>(observer => observer.next(false));
      })
    );
  }
}

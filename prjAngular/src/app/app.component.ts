import { Component } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'prjAngular';
  userName: string | null = null;

  constructor(public authService: AuthService, private router: Router) {
    
  }
  ngOnInit() {
    // Sayfa yüklendiğinde kullanıcı bilgilerini getir
    this.authService.getUserByToken().subscribe(user => {
      if (user) {
        this.userName = user.username;  // Kullanıcı adını atıyoruz
        console.log(",,,,,,,,,,,,,,",user.id)
        this.authService.getUserPermissions(user.id).subscribe(permissions => {
          console.log("Kullanıcı İzinleri:", permissions);

          // Kullanıcı rolleri ve izinlerine göre yönlendirme yap
          this.authService.getUserRoles(user.id).subscribe(roles => {
            console.log("Kullanıcı Rolleri:", roles);

            if (roles.includes('Admin')) {
              this.router.navigate(['/users']);
            } else if (roles.includes('user')) {
              this.router.navigate(['/user']);
            } else {
              this.router.navigate(['/login']);
            }
          });
        });
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.userName = null;
  }
}

import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'prjAngular';
  userName: string | null = null;
  userId: string | null = null;  // Kullanıcı ID'si burada saklanacak
  permissions: string[] = [];  // Kullanıcı izinleri burada saklanacak

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    // Sayfa yüklendiğinde kullanıcı bilgilerini getir
    this.authService.getUserByToken().subscribe({
      next: user => {
        if (!user) {
          // Eğer kullanıcı bilgisi gelmediyse, login sayfasına yönlendir veya uygun bir işlem yap
          console.log('Kullanıcı bulunamadı. Login sayfasına yönlendiriyorum...');
          this.router.navigate(['/']);
          return;
        }

        console.log('Kullanıcı Bilgileri:', user);
        this.userName = user.name;  // Kullanıcı adını sakla
        this.userId = user.id;      // Kullanıcı ID'sini sakla

        // Kullanıcı ID'si null değilse izinlerini al
        if (this.userId) {
          this.authService.getUserPermissions(this.userId).subscribe({
            next: permissions => {
              console.log('Alınan izinler:', permissions);
              this.permissions = permissions;  // İzinleri sakla
            },
            error: err => {
              console.error('Hata oluştu:', err);
            },
            complete: () => {
              console.log('İzin kontrolü tamamlandı.');
            }
          });
        }
      },
      error: err => {
        console.error('Kullanıcı bilgileri alınamadı:', err);
      },
      complete: () => {
        console.log('Kullanıcı bilgisi alındı.');
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.userId = null;  // Logout işleminde ID'yi de temizliyoruz
    
  }
}

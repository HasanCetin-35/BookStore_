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
        console.log(this.userName)
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/']);
    this.userName = null;
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  email: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    
  ) {}

  login() {
    this.authService.login(this.email, this.password).subscribe(
      response => {
        // Token'ı kaydediyoruz
        console.log("token", response.token);
        this.authService.saveToken(response.token);

        // Token ile kullanıcı bilgilerini alıyoruz
        this.authService.getUserByToken().subscribe(user => {
          console.log("user bilgileri", user);

          if (user) {
            // Kullanıcı rollerini almak için API çağrısı
            this.authService.getUserRoles(user.id).subscribe(roles => {
              console.log("user roles", roles);

              if (roles.includes('Admin')) {
                // Admin'e yönlendir
                console.log("girdim admin");
                this.router.navigate(['/admin']);
              } else if (roles.includes('user')) {
                // Normal kullanıcıya yönlendir
                console.log("girdim user");
                this.router.navigate(['/user']);
              } else {
                // Rolü tanımlanmadıysa login sayfasına yönlendir
                this.router.navigate(['/login']);
              }
            }, (error: any) => {
              console.error("Kullanıcı rolleri alınırken hata oluştu:", error);
              this.errorMessage = 'Kullanıcı rolleri alınırken bir hata oluştu.';
              this.router.navigate(['/login']);
            });
          } else {
            // Eğer kullanıcı bilgileri alınamazsa login sayfasına yönlendirilir
            this.router.navigate(['/login']);
          }
        });
      },
      error => {
        // Hata mesajı gösterme
        this.errorMessage = 'Login işlemi başarısız oldu, bilgilerinizi kontrol edin!';
      }
    );
  }

  redirectToSignup() {
    this.router.navigate(['/signup']);
  }
}

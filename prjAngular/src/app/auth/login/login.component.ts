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
        console.log("Token:", response.token);
        this.authService.saveToken(response.token);
  
        this.authService.getUserByToken().subscribe(user => {
          if (user) {
            console.log("Kullanıcı Bilgileri:", user);
            
            
            this.authService.getUserPermissions(user.id).subscribe(permissions => {
              console.log("Kullanıcı İzinleri:", permissions);
  
              // Kullanıcı rolleri ve izinlerine göre yönlendirme yap
              this.authService.getUserRoles(user.id).subscribe(roles => {
                console.log("Kullanıcı Rolleri:", roles);
  
                if (roles.includes('Admin')) {
                  this.router.navigate(['/admin']);
                } else if (roles.includes('user')) {
                  this.router.navigate(['/user']);
                } else {
                  this.router.navigate(['/login']);
                }
              });
            });
          } else {
            this.router.navigate(['/login']);
          }
        });
      },
      error => {
        this.errorMessage = 'Login işlemi başarısız oldu, bilgilerinizi kontrol edin!';
      }
    );
  }
  

  redirectToSignup() {
    this.router.navigate(['/signup']);
  }
}

import { Component } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-signup',
    templateUrl: './signup.component.html',
    styleUrls: ['./signup.component.css']
})
export class SignupComponent {
    username: string = '';
    email: string = '';
    password: string = '';
    errorMessage: string = '';

    constructor(private authService: AuthService, private router: Router) { }

    signUp() {
        const userData = {
            Username: this.username,
            Email: this.email,
            Password: this.password
        };

        this.authService.signup(userData).subscribe(
            response => {
                // Başarılı kayıt sonrası login sayfasına yönlendir
                this.router.navigate(['/login']);
            },
            error => {
                // Hata mesajı
                this.errorMessage = 'Kayıt işlemi başarısız oldu, bilgilerinizi kontrol edin!';
            }//register form sql injection 
        );
    }
}

import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // HttpHeaders ekliyoruz
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  userMessage: string = "Welcome to the User Dashboard!";
  comments: any[] = []; // Yorumları tutmak için bir array
  apiUrl: string = 'http://localhost:5041/api/comments/user/comments'; // Yeni API URL'i
  

  constructor(private http: HttpClient, public authService: AuthService,private router: Router) {}

  ngOnInit(): void {
    // Kullanıcı bilgilerini alıyoruz
    this.authService.getUserByToken().subscribe(
      (user) => {
        if (user) {
          // Yorumları almak için getUserComments fonksiyonunu çağırıyoruz
          this.getUserComments();  
        }
      },
      (error) => {
        console.error('Kullanıcı bilgisi alınırken hata oluştu:', error);
      }
    );
  }

  getUserComments(): void {
    const token = this.authService.getToken(); // Token'ı alıyoruz
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`); // Token'ı header'a ekliyoruz
  
      this.http.get<any[]>(this.apiUrl, { headers }).subscribe(
        (response) => {
          // Yorumları sıralama yapmadan alıyoruz
          this.comments = response;
          console.log("asdlşasşsclslsdallsdalasşlsad",this.comments);
          
          // Son yapılan yorumu en alta ekliyoruz
          // Burada son yorum, yorumlar dizisinin başına ekleniyor
          // Eğer yeni yorum ekledikten sonra bu işlemi yapmak isterseniz, 'comments' dizisini güncelleyebilirsiniz.
        },
        (error) => {
          console.error('Yorumlar alınırken hata oluştu:', error); // Hata yönetimi
        }
      );
    }
  }
  getComment(){
    this.router.navigate(['/comment']);
  }
  getBooks(){
    this.router.navigate(['/books']);
  }
  
}

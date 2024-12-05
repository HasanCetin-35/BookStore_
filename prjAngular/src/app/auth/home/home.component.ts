import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { BookService } from '../book/book.component';
import { AuthService } from '../auth.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  books: any[] = [];
  newComments: { [key: string]: string } = {};
  commentSuccessMessages: { [key: string]: string } = {}; 
  private apiUrl = 'http://localhost:5041/api/comments/books'; // API URL

  constructor(
    public authService: AuthService,
    private bookService: BookService,
    private http: HttpClient,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadBooks(); 
  }

  // Tüm kitapları API'den çeker
  loadBooks() {
    this.bookService.getAllBooks().subscribe(data => {
      this.books = data;
      console.log("object", this.books);
      this.cdr.detectChanges();
    });
  }

  submitComment(bookId: string) {
    console.log("objectID", bookId);
    const comment = this.newComments[bookId]; 

    if (comment) {
      const token = this.authService.getToken(); 
      if (token) {
        const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
        const body = { text: comment }; 

       
        this.http.post(`${this.apiUrl}/${bookId}/comments`, body, { headers }).subscribe(
          (response: any) => {
            console.log('Yorum başarıyla yapıldı:', response);
            
            this.newComments[bookId] = ''; 

            
            this.commentSuccessMessages[bookId] = 'Yorumunuz onaylanınca yayına girecektir.';
            
            
            setTimeout(() => {
              this.commentSuccessMessages[bookId] = '';
            }, 5000);

           
            this.loadBooks(); 
          },
          error => {
            console.error('Yorum yaparken hata oluştu:', error);
          }
        );
      } else {
        console.log('Kullanıcı token bulunamadı!');
      }
    } else {
      console.log('Yorum boş olamaz.');
    }
  }
}

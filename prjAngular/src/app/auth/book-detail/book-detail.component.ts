import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent {
  books: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  canDeleteBook: boolean = false; 
  private apiUrl = 'http://localhost:5041/api/books';  

  constructor(private http: HttpClient, private router: Router,private authService: AuthService) {}
  ngOnInit(): void {
    this.getAllBooks();
    this.checkPermissions(); 
  }

  getAllBooks() {
    this.http.get<any[]>(this.apiUrl).subscribe(
      (response) => {
        this.books = response;  
      },
      (error) => {
        this.errorMessage = 'Kitaplar yüklenirken bir hata oluştu.';
        console.error('Error fetching books:', error);
      }
    );
  }
  checkPermissions(): void {
    // Kullanıcının izinlerini al
    this.authService.getUserByToken().subscribe((user) => {
      if (user) {
        this.authService.getUserPermissions(user.id).subscribe((permissions) => {
          this.canDeleteBook = permissions.includes('DeleteBook');
        });
      }
    });
  }

  deleteBook(bookId: string) {
    if(this.canDeleteBook){
      const deleteUrl = `${this.apiUrl}/${bookId}`;  

    this.http.delete(deleteUrl).subscribe(
      (response) => {
        this.successMessage = 'Kitap başarıyla silindi.';
        this.books = this.books.filter(book => book.id !== bookId); 
      },
      (error) => {
        this.errorMessage = 'Kitap silinirken bir hata oluştu.';
        console.error('Error deleting book:', error);
      }
    );
    }else{
      this.errorMessage = 'Silme işlemi için yeterli izniniz yok.';
    }
    
  }
}

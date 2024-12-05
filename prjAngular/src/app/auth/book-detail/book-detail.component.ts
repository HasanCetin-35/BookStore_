import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-book-detail',
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.css'
})
export class BookDetailComponent {
  books: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';

  private apiUrl = 'http://localhost:5041/api/books';  

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(): void {
    this.getAllBooks(); 
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

  deleteBook(bookId: string) {
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
  }
}

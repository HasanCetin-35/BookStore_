import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';


@Component({
  selector: 'app-addbook',
  templateUrl: './addbook.component.html',
  styleUrls: ['./addbook.component.css']
})
export class AddBookComponent {
  bookName: string = '';
  category: string = '';
  author: string = '';
  successMessage: string = '';
  errorMessage: string = '';

  private bookUrl = 'http://localhost:5041/api/books';  // API URL

  constructor(private http: HttpClient, private router: Router) {}

  addBook() {
    if (!this.bookName || !this.category || !this.author) {
      this.errorMessage = 'Tüm alanlar doldurulmalıdır.';
      return; 
    }
    const newBook = {
      bookName: this.bookName,
      category: this.category,
      author: this.author
    };

    this.http.post(this.bookUrl, newBook).subscribe(
      (response) => {
        this.successMessage = 'Kitap başarıyla eklendi.';
       
        this.bookName='';
        this.author='';
        this.category='';
      },
      (error) => {
        this.errorMessage = 'Kitap eklenirken bir hata oluştu.';
        console.error('Error adding book:', error);
      }
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookService {

  private apiUrl = 'http://localhost:5041/api/books/books-with-comments';  // Kitap API URL'i

  constructor(private http: HttpClient) {}

  getAllBooks(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }
}

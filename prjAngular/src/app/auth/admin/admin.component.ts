import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
 

  private apiUrl = 'http://localhost:5041/api/books';  

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit(): void {
   this.addBook()
    
  }

  
  getAllBooks(){
    this.router.navigate(['/admin/all-books']);
  }
  addBook() {
  
    this.router.navigate(['/admin/addbook']);
  }
  getUsers(){
    this.router.navigate(['/admin/users']);
  }
  getAllComment(){
    this.router.navigate(['/admin/all-comment']);
  }
  getRole(){
    this.router.navigate(['/admin/role']);
  }
  getComment(){
    this.router.navigate(['/admin/comment-approved']);
  }
  getRoleCreation(){
    this.router.navigate(['/admin/roleCreation'])
  }
}

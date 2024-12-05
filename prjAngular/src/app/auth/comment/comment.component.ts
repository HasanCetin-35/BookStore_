  import { HttpClient } from '@angular/common/http';
  import { Component, OnInit } from '@angular/core';


  @Component({
    selector: 'app-comment',
    templateUrl: './comment.component.html',
    styleUrls: ['./comment.component.css'],
  })
  export class CommentComponent implements OnInit {
    comments: any[] = []; // Tüm yorumları saklayacak dizi
    private apiUrl ='http://localhost:5041/api/comments/all-comments'
    isLoading = false; // Yükleme durumu kontrolü
    successMessage: string='';
    errorMessage: string='';

    constructor(private http: HttpClient) {}

    ngOnInit(): void {
      this.loadComments();
    }

    
    loadComments(): void {
      this.isLoading = true;
      this.http.get<any[]>(this.apiUrl).subscribe(
        (data) => {
          this.comments = data;
          console.log("Yorumlar:", this.comments);  
          this.isLoading = false;
        },
        (error) => {
          console.error('Yorumlar yüklenirken hata oluştu:', error);
          this.isLoading = false;
        }
      );
    }
    deleteComment(commentId:string){
      this.http.delete(`http://localhost:5041/api/comments/${commentId}`).subscribe(()=>{
        this.successMessage = 'Yorum başarıyla silindi.';
        this.comments=this.comments.filter(comment=>comment.id!== commentId);
      },
      (error) => {
        this.errorMessage = 'Yorum silinirken bir hata oluştu.';
        console.error('Error deleting comment:', error);
      })
    }
  }

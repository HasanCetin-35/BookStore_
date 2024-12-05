import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-comment-approval',
  templateUrl: './comment-approval.component.html',
  styleUrls: ['./comment-approval.component.css']
})
export class CommentApprovalComponent implements OnInit {
  comments: any[] = [];  // Yorumları tutacak dizi
  private apiUrl = 'http://localhost:5041/api/comments';  // Backend API URL

  constructor(private http: HttpClient, private authService: AuthService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.loadComments();  // Sayfa yüklendiğinde yorumları al
  }

  // Yorumları al
  loadComments() {
    this.http.get<any[]>(`${this.apiUrl}/all-comments`).subscribe(data => {
      this.comments = data;
      this.cdr.detectChanges();
      console.log("alkndaskldasdlaksdas",this.comments);  // Yorumları alıp comments dizisine atıyoruz
    }, error => {
      console.error('Yorumları yüklerken hata oluştu:', error);
    });
  }

  // Yorum onaylama işlemi
  approveComment(commentId: string) {
    const token = this.authService.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      this.http.put(`${this.apiUrl}/${commentId}/approve`, {}, { headers }).subscribe(
        (response: any) => {
          console.log('Yorum başarıyla onaylandı:', response);
          this.comments = this.comments.map(comment =>
            comment.id === commentId ? { ...comment, isApproved: 'Approved' } : comment
          );
        },
        error => {
          console.error('Yorum onaylama sırasında hata oluştu:', error);
        }
      );
    }
  }
  
  rejectComment(commentId: string) {
    const token = this.authService.getToken();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
  
      this.http.put(`${this.apiUrl}/${commentId}/reject`, {}, { headers }).subscribe(
        (response: any) => {
          console.log('Yorum başarıyla reddedildi:', response);
          this.comments = this.comments.map(comment =>
            comment.id === commentId ? { ...comment, isApproved: 'Rejected' } : comment
          );
        },
        error => {
          console.error('Yorum reddetme sırasında hata oluştu:', error);
        }
      );
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';


@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.css'],
})
export class CommentComponent implements OnInit {
  comments: any[] = []; // Tüm yorumları saklayacak dizi
  private apiUrl = 'http://localhost:5041/api/comments/all-comments';
  isLoading = false; // Yükleme durumu kontrolü
  successMessage: string = '';
  errorMessage: string = '';
  canDeleteComment: boolean = false; // Delete iznine sahip olup olmadığını kontrol etmek için

  constructor(private http: HttpClient, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadComments();
    this.checkPermissions(); // Kullanıcı izinlerini kontrol et
  }

  loadComments(): void {
    this.isLoading = true;
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        this.comments = data;
        console.log('Yorumlar:', this.comments);
        this.isLoading = false;
      },
      (error) => {
        console.error('Yorumlar yüklenirken hata oluştu:', error);
        this.isLoading = false;
      }
    );
  }

  checkPermissions(): void {
    // Kullanıcının izinlerini al
    this.authService.getUserByToken().subscribe((user) => {
      if (user) {
        this.authService.getUserPermissions(user.id).subscribe((permissions) => {
          // 'DeleteComment' izni varsa, silme işlemine izin ver
          this.canDeleteComment = permissions.includes('DeleteComment');
        });
      }
    });
  }

  deleteComment(commentId: string): void {
    if (this.canDeleteComment) {
      // Kullanıcıda 'DeleteComment' izni varsa, yorum silme işlemi yapılabilir
      this.http.delete(`http://localhost:5041/api/comments/${commentId}`).subscribe(
        () => {
          this.successMessage = 'Yorum başarıyla silindi.';
          this.comments = this.comments.filter((comment) => comment.id !== commentId);
        },
        (error) => {
          this.errorMessage = 'Yorum silinirken bir hata oluştu.';
          console.error('Error deleting comment:', error);
        }
      );
    } else {
      // Kullanıcının silme izni yoksa hata mesajı göster
      this.errorMessage = 'Silme işlemi için yeterli izniniz yok.';
    }
  }
}

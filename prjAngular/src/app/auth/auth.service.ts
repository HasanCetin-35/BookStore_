import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private loginUrl = 'http://localhost:5041/api/Users/login';
  private signupUrl = 'http://localhost:5041/api/Users/SignUp';
  private tokenUrl = 'http://localhost:5041/api/Users/get-user-by-token';
  private apiUrl = 'http://localhost:5041/api/Users';
  private userName: string | null = null;
  private userId: string | null = null;
  private role: string[] = [];  // Rolleri bir dizi olarak saklıyoruz

  constructor(private http: HttpClient) { }

  signup(userData: any): Observable<any> {
    return this.http.post<any>(`${this.signupUrl}`, userData);
  }

  login(email: string, password: string): Observable<{ token: string }> {
    const body = { email, password };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.http.post<{ token: string }>(this.loginUrl, body, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  // Kullanıcının rollerini almak için API çağrısı
  getUserRoles(userId: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${userId}/roles`).pipe(
      map(roles => {
        this.role = roles;  // Rolleri kaydediyoruz
        return roles;
      }),
      catchError(this.handleError)
    );
  }

  getUserByToken(): Observable<any> {
    const token = this.getToken(); // Token'ı al
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(this.tokenUrl, { headers }).pipe(
        map(user => {
          if (user) {
            this.userName = user.username;
            this.userId = user.id;

            // Kullanıcının rollerini almak için getUserRoles fonksiyonu çağrılıyor
            this.getUserRoles(user.id).subscribe(roles => {
              this.role = roles;  // Rolleri kaydediyoruz
            });

          }
          return user;
        }),
        catchError(this.handleError)  // Hata yönetimi
      );
    } else {
      return new Observable<any>(observer => observer.next(null)); // Token yoksa null döndür
    }
  }

  getUserName(): string | null {
    console.log(this.userName);
    return this.userName;
  }

  saveToken(token: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('token', token); // Token'ı sessionStorage'a kaydet
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('token'); // Token'ı sessionStorage'dan al
    }
    return null;
  }

  isLoggedIn(): boolean {
    return this.getToken() !== null;
  }

  isAdmin(): boolean {
    return this.role.includes('Admin');  // 'Admin' rolünü kontrol ediyoruz
  }

  hasRole(role: string): boolean {
    return this.role.includes(role);  // Verilen rolü kontrol ediyoruz
  }

  getRoles(): string[] {
    return this.role;  // Rolleri döndürüyoruz
  }

  isUser(): boolean {
    return this.role.includes('user');  // 'User' rolünü kontrol ediyoruz
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('token'); // Token'ı sil
    }
  }

  private handleError(error: any) {
    let errorMessage = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Bir hata oluştu: ${error.error.message}`;
    } else {
      errorMessage = `Sunucu hatası: ${error.status} ${error.message}`;
    }
    return throwError(errorMessage);
  }
}

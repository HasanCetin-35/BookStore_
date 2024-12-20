import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap, throwError } from 'rxjs';

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
  private userPermissions: string[] = []
  private dene: string[] = [];
  private isLoading: boolean = true;
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
  getUserPermissions(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`http://localhost:5041/api/roles/get-user-roles/${userId}`).pipe(
      map(roles => {
        // API'den gelen rollerin yapısını kontrol etmek için log ekliyoruz
        console.log("API'den dönen roller:", roles);
        this.dene = roles;
  
        // Roller içerisindeki izinleri çıkartıyoruz
        const permissions = roles.flatMap(role => {
          console.log("Rol İzinleri:", role.permissions);  // Rol izinlerini kontrol et
          return role.permissions ? role.permissions : [];  // Eğer permissions undefined veya null ise, boş dizi döndürüyoruz
        });
  
        console.log("Tüm İzinler:", permissions);  // Tüm izinleri kontrol et
  
        // Eğer izinler boşsa, boş bir dizi döndürürüz
        this.userPermissions = permissions.length ? permissions : [];
        console.log("User Permissions Kaydedildi:", this.userPermissions);  // Kaydedilen izinleri kontrol et
        return this.userPermissions;
      }),
      catchError(error => {
        console.error('İzinler alınırken bir hata oluştu:', error);
        return of([]);  // Hata durumunda boş bir dizi döndürüyoruz
      })
    );
  }
  
  
  

  // Kullanıcıya ait belirli bir izni kontrol etmek için fonksiyon
  hasPermission(permissions: string[]): boolean {
    return permissions.some(permission => this.userPermissions.includes(permission));
  }

  // Kullanıcının rollerini almak için API çağrısı
  getUserRoles(userId: string): Observable<string[]> {
    return this.http.get<{ roles: string[] }>(`${this.apiUrl}/${userId}/roles`).pipe(
      map(response => {
        console.log("İZİNLER",this.dene);
        this.role = response.roles || [];  // roles varsa eşitlenir, yoksa boş dizi atanır
        return this.role;  // roles dizisini döndürüyoruz
      }),
      catchError(this.handleError)
    );
}

getUserByToken(): Observable<any> {
  const token = this.getToken();
  if (!token) {
      return of(null); // Token yoksa null döndürüyoruz
  }

  const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

  return this.http.get<any>(this.tokenUrl, { headers }).pipe(
      switchMap(user => {
          if (!user) {
              this.isLoading = false;
              return of(null); // Kullanıcı bulunamadıysa null döndürüyoruz
          }

          this.userName = user.username;
          this.userId = user.id;

          // Kullanıcının rollerini alıp ekliyoruz
          return this.getUserRoles(user.id).pipe(
              map(roles => {
                  user.roles = roles; // Kullanıcının rollerini ekliyoruz
                  this.isLoading = false;  // Kullanıcı ve rol bilgileri yüklendiğinde loading durumu false olur
                  return user; // Güncellenmiş kullanıcı verisini döndürüyoruz
              })
          );
      }),
      catchError(err => {
          this.isLoading = false;
          return of(null); // Hata durumunda null döndürüyoruz
      })
  );
}



get isUserLoading(): boolean {
  return this.isLoading;
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

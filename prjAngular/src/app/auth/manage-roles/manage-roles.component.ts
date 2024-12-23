import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';

@Component({
  selector: 'app-manage-roles',
  templateUrl: './manage-roles.component.html',
  styleUrls: ['./manage-roles.component.css']
})
export class ManageRolesComponent implements OnInit {
  roles: any[] = []; // Rolleri saklayan dizi
  permissions: any[] = []; // Tüm izinlerin listesi (permissionId ve name)
  selectedRole: any; // Güncellenmek istenen rol
  selectedPermissions: string[] = []; // Seçilen izinler
  availablePermissions: { id: string, permissionName: string, description: string }[] = [];// Kullanıcının ekleyebileceği izinler
  permissionsToRemove: string[] = []; 
  isLoading = true;
  successMessage = '';
  errorMessage = '';

  private apiUrl = 'http://localhost:5041/api/roles/get-all-roles'; // Roller
  private permissionsApiUrl = 'http://localhost:5041/api/permissions'; // Tüm izinler
  private permissionByNameApiUrl = 'http://localhost:5041/api/permissions/by-name'; // İzin adını kullanarak ID'yi almak için

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadRoles(); // Rolleri yükle
    this.loadPermissions(); // Tüm izinleri yükle
  }

  // Rolleri yükle
  loadRoles(): void {
    this.isLoading = true; // Yükleme başlatılıyor
    this.http.get<any[]>(this.apiUrl).subscribe(
      (data) => {
        // 'user' ve 'admin' rollerini hariç tutarak diğer rolleri sakla
        this.roles = data.filter(role => role.roleName !== 'user' && role.roleName !== 'Admin');
        this.isLoading = false; // Yükleme tamamlandı
      },
      (error) => {
        this.errorMessage = 'Roller yüklenirken hata oluştu.'; // Hata mesajı
        console.error(error); // Hata bilgisi
        this.isLoading = false; // Yükleme tamamlandı
      }
    );
  }

  // Tüm izinleri yükle
  loadPermissions(): void {
    this.http.get<any[]>(this.permissionsApiUrl).subscribe(
      (data) => {
        this.permissions = data; // Tüm izinler
      },
      (error) => {
        console.error('İzinler yüklenirken hata oluştu.', error);
      }
    );
  }

  // İzinleri düzenlemek için modalı aç
  editPermissions(role: any): void {
    this.selectedRole = role;
    this.selectedPermissions = role.permissions; // Mevcut izinleri seçili yap
    this.availablePermissions = this.permissions.filter(permission => 
      !role.permissions.includes(permission.permissionName) // permission.name yerine sadece permission'ı kullanın
    );
    console.log("availablePermissions", this.availablePermissions);
  }

  // İzin eklemek için fonksiyon
  toggleAddPermission(permissionName: string): void {
    if (this.selectedPermissions.includes(permissionName)) {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permissionName);
    } else {
      this.selectedPermissions.push(permissionName);
    }
  }

  // İzin kaldırma (seçilen izinleri kaldır)
  removePermission(permissionName: string): void {
    const index = this.selectedPermissions.indexOf(permissionName);
    if (index !== -1) {
      this.selectedPermissions.splice(index, 1); // Seçilen izinleri kaldır
    }
  }

  // Kaldırılacak izinlerin seçim durumu
  toggleRemovePermission(permissionName: string): void {
    const index = this.permissionsToRemove.indexOf(permissionName);
    if (index === -1) {
      this.permissionsToRemove.push(permissionName); // İzin ekle
    } else {
      this.permissionsToRemove.splice(index, 1); // İzin kaldır
    }
    console.log('Kaldırılacak İzinler:', this.permissionsToRemove);
  }

  // İzinleri eklemek için API çağrısı
  async addPermissionsToRole(): Promise<void> {
    try {
      // selectedPermissions içindeki izin isimlerini ID'lerine dönüştür
      const permissionIds: string[] = [];
      for (const permissionName of this.selectedPermissions) {
        const permissionId = await this.getPermissionIdAsPromise(permissionName);
        permissionIds.push(permissionId);
      }
  
      // API'ye POST isteği gönder
      if (permissionIds.length > 0) {
        await this.http.post(
          `http://localhost:5041/api/roles/${this.selectedRole.roleId}/permissions/add`,
          permissionIds // ID'leri içeren dizi
        ).toPromise();
  
        // Başarı mesajı
        this.successMessage = 'İzinler başarıyla eklendi.';
        window.location.reload();
        this.errorMessage = ''; // Hata mesajını sıfırla
      }
    } catch (error) {
      console.error('API Error:', error);
      // Hata mesajı
      this.successMessage = ''; // Başarı mesajını sıfırla
      this.errorMessage = 'İzin eklenirken bir hata oluştu.';
    }
  }

  // İzin kaldırmak için API çağrısı
  async removePermissionsFromRole(): Promise<void> {
    try {
      if (this.permissionsToRemove.length === 0) {
        console.error('Kaldırılacak izinler bulunamadı.');
        this.successMessage = ''; // Başarı mesajını sıfırla
        this.errorMessage = 'Kaldırılacak izinler bulunamadı.';
        return;
      }
  
      // permissionsToRemove içindeki izin isimlerini ID'lerine dönüştür
      const permissionIds: string[] = [];
      for (const permissionName of this.permissionsToRemove) {
        const permissionId = await this.getPermissionIdAsPromise(permissionName);
        permissionIds.push(permissionId);
      }
  
      console.log('Kaldırılacak İzinler (ID):', permissionIds);
  
      // API'ye POST isteği gönder (izinleri kaldırmak için)
      if (permissionIds.length > 0) {
        const response = await this.http.post(
          `http://localhost:5041/api/roles/${this.selectedRole.roleId}/permissions/remove`,
          permissionIds // ID'leri içeren dizi
        ).toPromise();
  
        // Başarı mesajı
        this.successMessage = 'İzinler başarıyla kaldırıldı.';
        window.location.reload();
        this.errorMessage = ''; // Hata mesajını sıfırla
      }
    } catch (error) {
      console.error('API Error:', error);
      // Hata mesajı
      this.successMessage = ''; // Başarı mesajını sıfırla
      this.errorMessage = 'İzin kaldırma işlemi sırasında hata oluştu.';
    }
  }

  // Observable yerine Promise dönen bir yardımcı fonksiyon
  getPermissionIdAsPromise(permissionName: string): Promise<string> {
    return this.http.get<any>(`${this.permissionByNameApiUrl}/${permissionName}`).pipe(
      map(response => response.id) // İzin adından ID'yi alıyoruz
    ).toPromise();
  }
  isPermissionSelected(permissionName: string): boolean {
    return this.selectedPermissions.includes(permissionName);
  }
  closeModal(): void {
    this.selectedRole = null; // Modalı kapatmak için seçilen rolü sıfırlıyoruz
  }
  async removeRole(roleId: string): Promise<void> {
    try {
      const response = await this.http.delete(
        `http://localhost:5041/api/roles/${roleId}`
      ).toPromise();

      this.successMessage = 'Rol başarıyla silindi.';
      this.loadRoles(); // Roller listesine tekrar yükle
      this.errorMessage = ''; // Hata mesajını sıfırla
      this.closeModal(); // Modalı kapat
    } catch (error) {
      console.error('Rol silme hatası:', error);
      this.successMessage = ''; // Başarı mesajını sıfırla
      this.errorMessage = 'Rol silinirken bir hata oluştu.';
    }
  }
}

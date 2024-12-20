import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-roleCreation',
  templateUrl: './roleCreation.component.html',
  styleUrls: ['./roleCreation.component.css']
})
export class RoleCreationComponent implements OnInit {
  currentStage: number = 1; // Mevcut adım (1: Rol Adı, 2: İzinler)
  roleName: string = ''; // Yeni rol adı
  roleId: string = ''; // Backend'den dönen rol ID'si
  permissions: { id: string; permissionName: string; description: string }[] = [];
  selectedPermissions: string[] = []; // Seçilen izinler
  successMessage: string = ''; // Başarı mesajı
  errorMessage: string = ''; // Hata mesajı
  isLoading: boolean = false; // Yüklenme durumu

  private apiUrl = 'http://localhost:5041/api/roles'; // API URL

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getAllPermissions(); // Tüm izinleri yükle
  }

  // Tüm izinleri yükle
  getAllPermissions(): void {
    this.http.get<{ id: string; permissionName: string; description: string }[]>(`http://localhost:5041/api/permissions`).subscribe(
      (response) => {
        this.permissions = response;
      },
      (error) => {
        this.errorMessage = 'İzinler alınırken bir hata oluştu.';
        console.error(error);
      }
    );
  }

  // Rol adı oluştur
  createRole(): void {
    if (!this.roleName.trim()) {
      this.errorMessage = 'Rol adı boş olamaz.';
      return;
    }

    this.isLoading = true;

    const newRole = { roleName: this.roleName };

    this.http.post<{ id: string }>(`${this.apiUrl}/create`, newRole).subscribe(
      (response) => {
        this.successMessage = 'Rol başarıyla oluşturuldu.';
        this.roleId = response.id; // Backend'den dönen rol ID
        this.errorMessage = '';
        this.isLoading = false;
        console.log("alsdnalskdaksdasd",this.roleId);
        this.currentStage = 2; // İkinci aşamaya geç
      },
      (error) => {
        this.errorMessage = 'Rol oluşturulurken bir hata oluştu.';
        this.successMessage = '';
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  // Role izinleri ekle
  addPermissionsToRole(): void {
    if (this.selectedPermissions.length === 0) {
      this.errorMessage = 'En az bir izin seçmelisiniz.';
      return;
    }

    console.log("rolId",this.roleId);
    this.isLoading = true;

    const permissionsData = this.selectedPermissions

    this.http.post(`${this.apiUrl}/assign-permissions/${this.roleId}`, permissionsData).subscribe(
      () => {
        this.successMessage = 'İzinler başarıyla ilişkilendirildi.';
        this.errorMessage = '';
        this.isLoading = false;
        // Form sıfırlanabilir
        this.roleName = '';
        this.selectedPermissions = [];
        this.currentStage = 1; // İlk aşamaya geri dön
      },
      (error) => {
        this.errorMessage = 'İzinler ilişkilendirilirken bir hata oluştu.';
        this.successMessage = '';
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  // İzin seçimini değiştir
  togglePermission(permission: string): void {
    if (this.selectedPermissions.includes(permission)) {
      this.selectedPermissions = this.selectedPermissions.filter(p => p !== permission);
    } else {
      this.selectedPermissions.push(permission);
    }
  }
}

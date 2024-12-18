import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.css']
})
export class AdminRolesComponent implements OnInit {
  users: any[] = [];
  roles: any[] = [];
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  roleToAdd: { [key: string]: string } = {};
  searchText: string = '';

  private apiUrl = 'http://localhost:5041/api/Users';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.getUsers();
    this.getAllRoles();
  }

  getUsers(): void {
    this.http.get<any[]>(`${this.apiUrl}`).subscribe(
      (response) => {
        this.users = response;

        this.users.sort((a, b) => a.username.localeCompare(b.username));

        this.users.forEach(user => {
          if (!this.roleToAdd[user.id]) {
            this.roleToAdd[user.id] = '';
          }

          // Get user roles from the backend
          this.getUserRoles(user.id);
        });
      },
      (error) => {
        this.errorMessage = 'Kullanıcılar alınırken bir hata oluştu.';
        console.error(error);
      }
    );
  }
  getAllRoles(): void {
    const rolesApiUrl = 'http://localhost:5041/api/roles/get-all-roles';
    this.http.get<any[]>(rolesApiUrl).subscribe(
      (response) => {
        this.roles = response;
      },
      (error) => {
        this.errorMessage = 'Roller alınırken bir hata oluştu.';
        console.error(error);
      }
    );
  }

  // Kullanıcının rollerini al
  getUserRoles(userId: string): void {
    this.http.get<string[]>(`${this.apiUrl}/${userId}/roles`).subscribe(
      (roles) => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.roles = roles;  // User'ın rol listesini güncelle
        }
      },
      (error) => {
        console.error('Kullanıcı rollerini alırken hata oluştu:', error);
      }
    );
  }

  filteredUsers(): any[] {
    if (!this.searchText) {
      return this.users;
    }
    const lowerCaseSearch = this.searchText.toLowerCase();
    return this.users.filter(user =>
      user.username.toLowerCase().includes(lowerCaseSearch)
    );
  }

  addRole(UserId: string): void {
    const roleName = this.roleToAdd[UserId];
    if (!roleName) {
      this.errorMessage = 'Bir rol seçmelisiniz.';
      return;
    }

    this.isLoading = true;

    const updateRoleDto = { UserId, roleName };

    this.http.post(`${this.apiUrl}/add-role`, updateRoleDto).subscribe(
      () => {
        this.successMessage = 'Rol başarıyla eklendi.';
        this.isLoading = false;
        this.getUsers();
      },
      (error) => {
        this.errorMessage = 'Rol eklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error(error);
      }
    );
  }

  removeRole(UserId: string, roleName: string): void {
    this.isLoading = true;

    const updateRoleDto = { UserId, roleName };

    this.http.post(`${this.apiUrl}/remove-role`, updateRoleDto).subscribe(
      () => {
        this.successMessage = 'Rol başarıyla kaldırıldı.';
        this.isLoading = false;
        this.getUsers();
      },
      (error) => {
        this.errorMessage = 'Rol kaldırılırken bir hata oluştu.';
        this.isLoading = false;
        console.error(error);
      }
    );
  }
  getPermissionsForRole(roleName: string): string[] {
    const role = this.roles.find(r => r.roleName === roleName);
    return role ? role.permissions : [];
  }
}

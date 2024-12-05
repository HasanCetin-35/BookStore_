import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  filteredUsers: any[] = [];
  errorMessage: string = '';
  private apiUrl = 'http://localhost:5041/api/Users';
  successMessage: string = '';
  searchText: string = ''; // Search text

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.getUsers();
  }

  // Get users from the API
  getUsers() {
    this.http.get<any[]>(`${this.apiUrl}?searchText=${this.searchText}`).subscribe(
      (response) => {
        this.users = response; // Save users
        this.filterUsers(); // Filter users
      },
      (error) => {
        this.errorMessage = 'An error occurred while fetching users.';
        console.error('Error fetching users:', error);
      }
    );
  }

  // Filter users
  filterUsers() {
    if (this.searchText) {
      this.filteredUsers = this.users.filter(user => 
        user.username.toLowerCase().includes(this.searchText.toLowerCase())
      );
    } else {
      this.filteredUsers = [...this.users]; // Show all users if search is empty
    }
  }

  // Called when the search text changes
  onSearchChange() {
    this.getUsers(); // Fetch users when search is performed
  }

  // Delete user
  deleteUser(userId: string) {
    this.http.delete(`${this.apiUrl}/${userId}`).subscribe(
      () => {
        this.successMessage = 'User successfully deleted.';
        this.users = this.users.filter(user => user.id !== userId); // Remove user from the list
        this.filterUsers(); // Re-filter after deletion
      },
      (error) => {
        this.errorMessage = 'An error occurred while deleting the user.';
        console.error('Error deleting user:', error);
      }
    );
  }
}

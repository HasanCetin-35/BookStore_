import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { UserComponent } from './user/user.component';
import { HomeComponent } from './home/home.component';
import { SignupComponent } from './signup/signup.component';
import { AddBookComponent } from './addbook/addbook.component';
import { RouterModule } from '@angular/router';
import { AdminUsersComponent } from './admin-users/admin-users.component';
import { CommentComponent } from './comment/comment.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { AdminRolesComponent } from './admin-roles/admin-roles.component';
import { UnauthorizedComponent } from '../unauthorized/unauthorized.component';
import { CommentApprovalComponent } from './comment-approval/comment-approval.component';

@NgModule({
  declarations: [
    LoginComponent,
    SignupComponent,
    AdminComponent,  
    UserComponent,
    HomeComponent,
    AddBookComponent,
    AdminUsersComponent,
    CommentComponent,
    BookDetailComponent,
    AdminRolesComponent, 
    UnauthorizedComponent, CommentApprovalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  exports: [
    LoginComponent,
    SignupComponent,
    AddBookComponent,
    AdminComponent,  // Export ettik
    UserComponent,
    HomeComponent    // Export ettik
  ]
})
export class AuthModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { UserComponent } from './auth/user/user.component';
import { AuthGuard } from './auth/auth-guard.guard';
import { AdminComponent } from './auth/admin/admin.component';
import { HomeComponent } from './auth/home/home.component';
import { SignupComponent } from './auth/signup/signup.component';
import { AddBookComponent } from './auth/addbook/addbook.component';
import { AdminUsersComponent } from './auth/admin-users/admin-users.component';
import { CommentComponent } from './auth/comment/comment.component';
import { BookDetailComponent } from './auth/book-detail/book-detail.component';
import { AdminRolesComponent } from './auth/admin-roles/admin-roles.component';
import { UnauthorizedComponent } from './unauthorized/unauthorized.component';
import { CommentApprovalComponent } from './auth/comment-approval/comment-approval.component';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] }, 
    children: [
      {
        path: 'addbook',  // Kitap ekleme rotası
        component: AddBookComponent
      },
      {
        path: 'users',
        component: AdminUsersComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] } 
      },
      {
        path: 'all-comment',
        component: CommentComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] } 
      },
      {
        path: 'all-books',
        component: BookDetailComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] } 
      },{
        path: 'role',
        component: AdminRolesComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] } 
      },
      {
        path: 'comment-approved',
        component: CommentApprovalComponent,
        canActivate: [AuthGuard],
        data: { roles: ['Admin'] }, 
      },
    ]
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user'] }, 
  },
  {
    path: 'comment',
    component: CommentComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Moderator'] }, 
  },
  {
    path: 'books',
    component: BookDetailComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Moderator'] }, 
  },
  {
    path: 'addbooks',
    component: AddBookComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Editor'] }, 
  },
  {
    path: 'comment-approved',
    component: CommentApprovalComponent,
    canActivate: [AuthGuard],
    data: { roles: ['Support'] }, 
  },
  
  {
    path: 'unauthorized',
    component: UnauthorizedComponent // Yetkisiz erişim sayfası
  },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '', component: HomeComponent }, // Ana sayfa
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}

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
import { RoleCreationComponent } from './auth/roleCreation/roleCreation.component';
import { UserGuard } from './auth/user_guard';
import { AdminGuard } from './auth/admin_guard';

const routes: Routes = [
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AdminGuard],
    children: [
      { path: 'addbook', component: AddBookComponent },
      { path: 'users', component: AdminUsersComponent },
      { path: 'all-comment', component: CommentComponent },
      { path: 'all-books', component: BookDetailComponent },
      { path: 'role', component: AdminRolesComponent },
      { path: 'comment-approved', component: CommentApprovalComponent },
      { path: 'roleCreation', component: RoleCreationComponent },
    ],
  },
  {
    path: 'user',
    component: UserComponent,
    canActivate: [AuthGuard],
    data: { roles: ['user'] }
  },
  {
    path: 'comment',
    component: CommentComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['DeleteComment','ListComments','ViewCommentStatus'] }, 
  },
  {
    path: 'books',
    component: BookDetailComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['ListBooks','DeleteBook'] }, 
  },
  {
    path: 'addbooks',
    component: AddBookComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['AddBook'] }, 
  },
  {
    path: 'comment-approved',
    component: CommentApprovalComponent,
    canActivate: [AuthGuard],
    data: { permissions: ['ViewCommentStatus'] }, 
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

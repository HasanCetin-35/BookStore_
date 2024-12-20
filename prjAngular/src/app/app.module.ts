// src/app/app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';  // ngModel için gerekli
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';

import { AuthService } from './auth/auth.service';
import { AuthModule } from './auth/auth.module'; // AuthModule'ü import ediyoruz
import { AuthGuard } from './auth/auth-guard.guard';
import { AdminGuard } from './auth/admin_guard';
import { UserGuard } from './auth/user_guard';




@NgModule({
  declarations: [
    AppComponent,
    
     // Yalnızca AppComponent burada deklare edilmeli
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    AuthModule, // AuthModule tüm bileşenleri içeriyor
  ],
  providers: [
    AuthGuard,
    AdminGuard,
    UserGuard,
    AuthService,
    provideHttpClient(withFetch()),
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

// unauthorized.component.ts
import { Component } from '@angular/core';

@Component({
  selector: 'app-unauthorized',
  template: `
    <div class="container text-center mt-5">
      <h1 class="text-danger">Yetkisiz Erişim</h1>
      <p>Bu sayfayı görüntüleme yetkiniz yok.</p>
    </div>
  `,
  styleUrls: ['./unauthorized.component.css']
})
export class UnauthorizedComponent {}

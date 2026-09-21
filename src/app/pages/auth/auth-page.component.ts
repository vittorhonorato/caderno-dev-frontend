import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { map } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth-page.component.html'
})
export class AuthPageComponent {
  isLogin = true;
  isLoading = false;
  notice = '';
  error = '';
  auth = { email: '', username: '', password: '' };

  constructor(private readonly authService: AuthService, private readonly router: Router) {}

  submit(): void {
    this.clearMessages();
    this.isLoading = true;
    const request = this.isLogin
      ? this.authService.login({ username: this.auth.username, password: this.auth.password }).pipe(map(() => undefined))
      : this.authService.register(this.auth);
    request.subscribe({
      next: () => {
        this.isLoading = false;
        if (this.isLogin) this.router.navigate(['/dashboard']);
        else { this.isLogin = true; this.auth.password = ''; this.notice = 'Conta criada. Agora entre para acessar suas anotações.'; }
      },
      error: (response: HttpErrorResponse) => { this.isLoading = false; this.error = this.readError(response, 'Não foi possível concluir o acesso.'); }
    });
  }

  toggleMode(): void { this.isLogin = !this.isLogin; this.clearMessages(); }
  private clearMessages(): void { this.notice = ''; this.error = ''; }
  private readError(response: HttpErrorResponse, fallback: string): string {
    return typeof response.error === 'string' ? response.error : response.error?.message ?? fallback;
  }
}

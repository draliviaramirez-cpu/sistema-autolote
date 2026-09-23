import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  email = '';
  password = '';
  error = '';
  loading = false;

  login(): void {
    this.error = '';
    this.loading = true;

    this.http.post<{ token: string }>('http://localhost:3000/api/auth/login', {
      email: this.email,
      password: this.password
    }).subscribe({
      next: ({ token }) => {
        localStorage.setItem('token', token);
        this.router.navigate(['/clientes']);
      },
      error: (error) => {
        this.error = error.error?.error || 'No se pudo iniciar sesión.';
        this.loading = false;
      }
    });
  }
}

import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { ApiService } from '../../services/api.service';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.html',
})
export class Login {
  loginData = signal<LoginData>({
    email: 'chien@gmail.com',
    password: 'test',
  });
  loginForm = form(this.loginData);
  errorMessage = signal<string | null>(null);

  constructor(private api: ApiService) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const email = this.loginData().email;
    const password = this.loginData().password;
    this.errorMessage.set(null); // Clear previous error message

    this.api.post('auth/login', { email, password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Handle successful login, e.g., store token, navigate to home, etc.
      },
      error: (error) => {
        if (error.status === 401) {
          this.errorMessage.set('Email ou mot de passe invalide. Veuillez réessayer.');
        } else {
          this.errorMessage.set('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      },
    });
  }
}

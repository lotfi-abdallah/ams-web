import { Component, signal } from '@angular/core';
import { form } from '@angular/forms/signals';
import { ApiService } from '../../services/api.service';

interface LoginData {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  imports: [],
  templateUrl: './login.html',
})
export class Login {
  loginData = signal<LoginData>({
    email: 'mail@mail.com',
    password: 'pass',
  });
  loginForm = form(this.loginData);

  constructor(private api: ApiService) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const email = this.loginData().email;
    const password = this.loginData().password;

    this.api.post('auth/login', { email, password }).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        // Handle successful login, e.g., store token, navigate to home, etc.
      },
      error: (error) => {
        console.error('Login failed:', error);
        // Handle login error, e.g., show error message to user
      },
    });
  }
}

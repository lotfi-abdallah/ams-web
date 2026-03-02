import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

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

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router: Router,
    private notification: NotificationService,
  ) {}

  onSubmit(event: Event) {
    event.preventDefault();
    const email = this.loginData().email;
    const password = this.loginData().password;

    this.api.post('auth/login', { email, password }).subscribe({
      next: (response: any) => {
        const user = response.user as User;
        const lastCnx = this.auth.getLatestConnection(user.id);
        this.auth.saveLatestConnection(user.id);

        const lastCnxMsg = lastCnx
          ? `Dernière connexion : ${new Date(lastCnx).toLocaleString('fr-FR')}`
          : 'Première connexion !';
        this.notification.success(lastCnxMsg, 'Connexion réussie, Bienvenue ' + user.nom + ' !');

        this.auth.fetchCurrentUser();
        this.router.navigate(['/']);
      },
      error: (error) => {
        if (error.status === 401) {
          this.notification.error('Email ou mot de passe invalide. Veuillez réessayer.');
        } else {
          this.notification.error('Une erreur est survenue. Veuillez réessayer plus tard.');
        }
      },
    });
  }
}

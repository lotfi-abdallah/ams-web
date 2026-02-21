import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { tap } from 'rxjs';

export interface User {
  id: number;
  mail: string;
  pseudo: string;
  nom: string;
  prenom: string;
  avatar: string;
  statut_connexion: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(private api: ApiService) {}

  setUser(user: User | null) {
    this._user.set(user);
  }

  logout() {
    return this.api.post('auth/logout', {}).pipe(tap(() => this._user.set(null)));
  }

  fetchCurrentUser() {
    return this.api.get('auth/me').subscribe({
      next: (response: any) => this._user.set(response.user),
      error: () => this._user.set(null),
    });
  }
}

import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SocketService } from './socket.service';
import { tap } from 'rxjs';
import { User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();

  constructor(
    private api: ApiService,
    private socket: SocketService,
  ) {}

  bootstrap(): void {
    this.fetchCurrentUser().subscribe({
      next: () => this.socket.connect(),
    });
  }

  setUser(user: User | null) {
    this._user.set(user);
  }

  logout() {
    return this.api.post('auth/logout', {}).pipe(tap(() => this._user.set(null)));
  }

  fetchCurrentUser() {
    return this.api.get('auth/me').pipe(
      tap({
        next: (response: any) => this._user.set(response.user),
        error: () => this._user.set(null),
      }),
    );
  }

  saveLatestConnection(id: number) {
    localStorage.setItem(`latestConnection_${id}`, new Date().toISOString());
  }

  getLatestConnection(id: number): string | null {
    return localStorage.getItem(`latestConnection_${id}`);
  }
}

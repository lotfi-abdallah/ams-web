import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { SocketService } from './socket.service';
import { User } from '../models';
import { UserConnectedPayload, UserDisconnectedPayload } from './socket-events';

type ConnectedUser = Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom' | 'avatar'>;

@Injectable({ providedIn: 'root' })
export class ConnectedUsersService {
  private usersSignal = signal<ConnectedUser[]>([]);
  readonly users = this.usersSignal.asReadonly();
  private started = false;

  constructor(
    private api: ApiService,
    private socket: SocketService,
  ) {}

  start(): void {
    if (this.started) return;
    this.started = true;

    this.socket.on<UserConnectedPayload>('user:connected', (payload) => {
      this.upsert(payload);
    });

    this.socket.on<UserDisconnectedPayload>('user:disconnected', (payload) => {
      this.remove(payload.id);
    });
  }

  refresh(): void {
    this.api.get<{ users: ConnectedUser[] }>('auth/connected-users').subscribe({
      next: (response) => {
        this.setUsers(response.users ?? []);
      },
      error: () => this.usersSignal.set([]),
    });
  }

  clear(): void {
    this.usersSignal.set([]);
  }

  private setUsers(users: ConnectedUser[]): void {
    const byId = new Map<number, ConnectedUser>();
    for (const user of users) {
      if (typeof user?.id === 'number') {
        byId.set(user.id, user);
      }
    }
    const sorted = Array.from(byId.values()).sort((a, b) => a.id - b.id);
    this.usersSignal.set(sorted);
  }

  private upsert(user: ConnectedUser): void {
    this.usersSignal.update((current) => {
      const next = current.filter((item) => item.id !== user.id);
      next.push(user);
      next.sort((a, b) => a.id - b.id);
      return next;
    });
  }

  private remove(id: number): void {
    this.usersSignal.update((current) => current.filter((item) => item.id !== id));
  }
}

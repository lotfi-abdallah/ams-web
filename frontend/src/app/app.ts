import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { AuthService } from '../services/auth.service';
import { SocketService } from '../services/socket.service';
import { NotificationService } from '../services/notification.service';

interface UserConnectedPayload {
  id: number;
  pseudo: string;
  nom: string;
  prenom: string;
  avatar: string;
}

interface UserDisconnectedPayload {
  id: number;
  pseudo: string;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('frontend');

  constructor(
    private auth: AuthService,
    private socket: SocketService,
    private notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe({
      next: () => this.socket.connect(),
    });

    this.socket.on<UserConnectedPayload>('user:connected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.success(
        `${data.prenom} ${data.nom} vient de se connecter.`,
      );
    });

    this.socket.on<UserDisconnectedPayload>('user:disconnected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.error(`${data.pseudo} vient de se déconnecter.`);
    });
  }

  ngOnDestroy(): void {
    this.socket.off('user:connected');
    this.socket.off('user:disconnected');
  }
}

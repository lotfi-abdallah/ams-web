import { Injectable } from '@angular/core';
import { SocketService } from './socket.service';
import { NotificationService } from './notification.service';
import { AuthService } from './auth.service';
import {
  PostNotificationPayload,
  UserConnectedPayload,
  UserDisconnectedPayload,
} from './socket-events';

@Injectable({ providedIn: 'root' })
export class NotificationListenerService {
  constructor(
    private socket: SocketService,
    private notification: NotificationService,
    private auth: AuthService,
  ) {}

  start(): void {
    this.socket.on<UserConnectedPayload>('user:connected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.success(
        `${data.prenom} ${data.nom} vient de se connecter.`,
        'Nouvelle connexion',
      );
    });

    this.socket.on<UserDisconnectedPayload>('user:disconnected', (data) => {
      if (data.id === this.auth.user()?.id) return;
      this.notification.error(`${data.pseudo} vient de se déconnecter.`, 'Déconnexion');
    });

    this.socket.on<PostNotificationPayload>('post:liked', (data) => {
      this.notification.success(`${data.by.pseudo} a aimé votre post.`, 'Nouveau like');
    });

    this.socket.on<PostNotificationPayload>('post:commented', (data) => {
      this.notification.success(`${data.by.pseudo} a commenté votre post.`, 'Nouveau commentaire');
    });

    this.socket.on<PostNotificationPayload>('post:shared', (data) => {
      this.notification.success(`${data.by.pseudo} a partagé votre post.`, 'Nouveau partage');
    });
  }
}

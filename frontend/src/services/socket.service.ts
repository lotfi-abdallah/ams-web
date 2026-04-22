import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket = io('https://localhost:3189', {
    withCredentials: true,
    transports: ['websocket', 'polling'],
  });

  ngOnDestroy(): void {
    this.socket.disconnect();
  }

  /**
   * Écoute un événement spécifique du serveur et exécute une fonction de rappel lorsque cet événement est reçu.
   * @param event Le nom de l'événement à écouter.
   * @param callback La fonction de rappel à exécuter lorsque l'événement est reçu.
   */
  on<T>(event: string, callback: (data: T) => void): void {
    this.socket.on(event, callback);
  }

  off(event: string): void {
    this.socket.off(event);
  }

  emit<T>(event: string, data?: T): void {
    this.socket.emit(event, data);
  }
}

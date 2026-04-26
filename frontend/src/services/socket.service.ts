import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `${window.location.protocol}//${window.location.hostname}:3189`;

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  on<T>(event: string, callback: (data: T) => void): void {
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.socket?.off(event);
  }

  emit<T>(event: string, data?: T): void {
    this.socket?.emit(event, data);
  }
}

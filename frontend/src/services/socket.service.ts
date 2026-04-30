import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = `https://${window.location.hostname}:3189`;

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private listeners = new Map<string, Set<(data: any) => void>>();

  connect(): void {
    if (this.socket?.connected) return;
    this.socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });
    for (const [event, callbacks] of this.listeners) {
      for (const cb of callbacks) this.socket.on(event, cb);
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }

  on<T>(event: string, callback: (data: T) => void): void {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(callback as (data: any) => void);
    this.socket?.on(event, callback);
  }

  off(event: string): void {
    this.listeners.delete(event);
    this.socket?.off(event);
  }

  emit<T>(event: string, data?: T): void {
    this.socket?.emit(event, data);
  }
}

import { API_BASE_URL } from "../config/apiConfig";
import { authService } from "./authService";
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
  constructor() {
    this.client = null;
    this.subscribers = new Map();
  }

  connect(onConnectedCallback, onErrorCallback) {
    const token = authService.getToken();
    
    this.client = new Client({
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws`),
      connectHeaders: {
        'Authorization': `Bearer ${token}`
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      
      onConnect: () => {
        // 저장된 모든 구독 복원
        this.subscribers.forEach((callback, destination) => {
          this.subscribe(destination, callback);
        });
        if (onConnectedCallback) onConnectedCallback();
      },
      
      onDisconnect: () => {
        console.log('Socket disconnected');
      },
      
      onStompError: (frame) => {
        if (onErrorCallback) onErrorCallback('Connection error: ' + frame.body);
      }
    });

    try {
      this.client.activate();
    } catch (err) {
      if (onErrorCallback) onErrorCallback('Failed to connect to server');
    }
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }
  }

  subscribe(destination, callback) {
    if (this.client && this.client.connected) {
      const subscription = this.client.subscribe(destination, callback);
      this.subscribers.set(destination, callback);
      return subscription;
    }
    // 연결되지 않은 경우 콜백 저장
    this.subscribers.set(destination, callback);
  }

  unsubscribe(destination) {
    if (this.client) {
      this.client.unsubscribe(destination);
    }
    this.subscribers.delete(destination);
  }

  publish(destination, message) {
    if (this.client && this.client.connected) {
      this.client.publish({
        destination: destination,
        body: JSON.stringify(message)
      });
    }
  }

  isConnected() {
    return this.client && this.client.connected;
  }
}

// 싱글톤 인스턴스 생성
export const socketService = new SocketService();
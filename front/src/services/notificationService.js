import { socketService } from "./SocketService";

class NotificationService {
  constructor() {
    this.onNotificationReceived = null;
  }

  setNotificationCallback(callback) {
    this.onNotificationReceived = callback;
  }

  connect() {
    socketService.subscribe('/user/queue/notifications', message => {
      try {
        const notification = JSON.parse(message.body);
        console.log("notificationService received:", notification);
        
        if (this.onNotificationReceived) {
          // 새로운 알림을 기존 알림 목록에 추가하기 위해
          // NotificationContext의 addNotification 호출
          this.onNotificationReceived(notification);
        }
      } catch (error) {
        console.error('Error parsing notification:', error);
      }
    });

    socketService.connect(
      () => {
        socketService.publish('/app/notifications/unread');
      },
      (error) => {
        console.error('Notification connection error:', error);
      }
    );
  }

  disconnect() {
    socketService.disconnect();
  }
}

export const notificationService = new NotificationService();
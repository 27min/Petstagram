// contexts/NotificationContext.js
import React, { createContext, useState, useContext } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import { authService } from '../services/authService';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // 새로운 알림 추가 함수 수정
  const addNotification = (newNotification) => {
    // 단일 객체인 경우 배열로 변환
    const notificationArray = Array.isArray(newNotification) 
      ? newNotification 
      : [newNotification];
    
    setNotifications(prev => {
      // 중복 방지를 위해 id 기준으로 필터링
      const uniqueNotifications = [...notificationArray, ...prev]
        .filter((notification, index, self) => 
          index === self.findIndex(n => n.id === notification.id)
        );
      return uniqueNotifications;
    });
  };

  // 단일 알림을 읽음 처리
  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_BASE_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify([notificationId])
      });

      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // 모든 읽지 않은 알림을 읽음 처리
  const markAllAsRead = async () => {
    const unreadNotificationIds = notifications
      .filter(n => !n.is_read)
      .map(n => n.id);

    if (unreadNotificationIds.length === 0) return;

    try {
      await fetch(`${API_BASE_URL}/api/notifications/read`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authService.getAuthHeader()
        },
        body: JSON.stringify(unreadNotificationIds)
      });

      setNotifications(prev => 
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // 읽지 않은 알림 개수 계산
  const getUnreadCount = (notifications) => {
    if (!Array.isArray(notifications)) {
      console.log('Received notifications:', notifications);
      return 0;
    }
    // read 또는 is_read 둘 다 체크
    return notifications.filter(notification => 
      !notification.read && !notification.is_read
    ).length;
  };

  const value = {
    notifications,
    setNotifications,
    addNotification,
    markAsRead,
    markAllAsRead,
    getUnreadCount
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => useContext(NotificationContext);
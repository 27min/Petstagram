// components/layout/Header.js
import React, { useState } from 'react';
import { useNotification } from '../../contexts/NotificationContext';
import { Bell, MessageSquare, UserPlus, Heart, MessageCircle } from 'lucide-react';

export const Header = ({ title }) => {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { notifications, markAllAsRead, getUnreadCount } = useNotification();
  
  // notifications가 undefined나 null일 경우를 처리
  const safeNotifications = notifications || [];
  const unreadCount = getUnreadCount(safeNotifications);

  const handleNotificationOpen = () => {
    if (!isNotificationOpen) {  // 열릴 때만 markAllAsRead 호출
      markAllAsRead();
    }
    setIsNotificationOpen(!isNotificationOpen);  // 토글 기능으로 변경
  };

  const handleClose = () => {
    setIsNotificationOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b flex items-center justify-between px-4 z-[1000] max-w-md mx-auto">
      <h1 className="text-lg font-semibold">{title}</h1>
      
      <div className="relative">
        <button 
          onClick={handleNotificationOpen}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {isNotificationOpen && (
          <NotificationDropdown 
            notifications={notifications} 
            onClose={handleClose}
          />
        )}
      </div>
    </header>
  );
};

// 알림 드롭다운 컴포넌트
const NotificationDropdown = ({ notifications, onClose }) => {
  // notifications가 배열인지 확인하고, 아니라면 빈 배열을 사용
  const notificationArray = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border z-50 max-h-96 overflow-y-auto">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">알림</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        {notificationArray.length === 0 ? (
          <p className="text-center text-gray-500 py-4">새로운 알림이 없습니다</p>
        ) : (
          <div className="space-y-3">
            {notificationArray.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// NotificationItem 컴포넌트 수정
const NotificationItem = ({ notification }) => {
  // 알림 타입에 따른 아이콘 매핑
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'NEW_MESSAGE':
        return <MessageSquare size={20} />; // lucide-react 아이콘 사용
      case 'NEW_FOLLOWER':
        return <UserPlus size={20} />;
      case 'NEW_LIKE':
        return <Heart size={20} />;
      case 'NEW_COMMENT':
        return <MessageCircle size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      
      // 날짜가 유효한지 확인
      if (isNaN(date.getTime())) {
        return '날짜 정보 없음';
      }

      // 오늘 날짜인 경우 시간만 표시
      const today = new Date();
      if (date.toDateString() === today.toDateString()) {
        return date.toLocaleTimeString('ko-KR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
      }
      
      // 오늘이 아닌 경우 날짜와 시간 모두 표시
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error);
      return '날짜 정보 없음';
    }
  };

  return (
    <div className={`p-3 rounded-md ${notification.isRead ? 'bg-white' : 'bg-blue-50'}`}>
      <div className="flex items-start gap-3">
        <span className="text-gray-600">
          {getNotificationIcon(notification.notificationType)}
        </span>
        <div className="flex-1">
          <p className="text-sm">{notification.content}</p>
          <span className="text-xs text-gray-500">
            {formatDate(notification.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Header;
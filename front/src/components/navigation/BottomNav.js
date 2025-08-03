import { useState, useEffect, useCallback } from 'react';
import { ChatService } from "../../services/chatService";
import { useAuth } from "../../hooks/useAuth";

export const BottomNav = ({ currentPage, onPageChange, refreshTrigger = 0 }) => {
  const { isAuthenticated } = useAuth();
  const [messageCount, setMessageCount] = useState(0);

  const fetchMessageCount = useCallback(async () => {
    if (isAuthenticated) {
      try {
        const count = await ChatService.getMessageCounts();
        setMessageCount(count);
      } catch (error) {
        console.error('메시지 카운트 조회 실패:', error);
      }
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchMessageCount();
  }, [fetchMessageCount, refreshTrigger]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-around z-[1000] max-w-md mx-auto">
      <button 
        className={`flex flex-col items-center justify-center w-1/5 ${currentPage === 'home' ? 'text-blue-500' : ''}`}
        onClick={() => onPageChange('home')}
      >
        <span className="text-sm">홈</span>
      </button>
      <button 
        className={`flex flex-col items-center justify-center w-1/5 ${currentPage === 'place' ? 'text-blue-500' : ''}`}
        onClick={() => onPageChange('place')}
      >
        <span className="text-sm">장소</span>
      </button>
      <button 
        className={`relative flex flex-col items-center justify-center w-1/5 ${currentPage === 'community' ? 'text-blue-500' : ''}`}
        onClick={() => onPageChange('community')}
      >
        <div className="relative">
          <span className="text-sm">커뮤니티</span>
          {isAuthenticated && messageCount > 0 && (
            <span className="absolute -top-3 -right-4 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {messageCount}
            </span>
          )}
        </div>
      </button>
      <button 
        className={`flex flex-col items-center justify-center w-1/5 ${currentPage === 'mypage' ? 'text-blue-500' : ''}`}
        onClick={() => onPageChange('mypage')}
      >
        <span className="text-sm">마이페이지</span>
      </button>
    </nav>
  );
};
import React, { useCallback, useEffect, useState } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'; // React Router 임포트
import Header from './components/layout/Header';
import { MainContent } from './components/layout/MainContent';
import { MobileLayout } from './components/layout/MobileLayout';
import { BottomNav } from './components/navigation/BottomNav';
import { NotificationProvider, useNotification } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './hooks/useAuth';
import SomeoneInfo from './pages/auth/SomeoneInfo'; // 정확한 경로로 SomeoneInfo 임포트
import { notificationService } from './services/notificationService';
import { getPageTitle, renderPage } from './utils/PageUtils';

const AppContent = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [pageData, setPageData] = useState({});
  const [refreshCounter, setRefreshCounter] = useState(0);
  const { isAuthenticated } = useAuth();
  const { setNotifications } = useNotification();

  useEffect(() => {
    if (isAuthenticated) {
      notificationService.setNotificationCallback((notifications) => {
        setNotifications(notifications);
      });
      notificationService.connect();
      return () => {
        notificationService.disconnect();
      };
    }
  }, [isAuthenticated, setNotifications]);

  const refreshMessageCount = useCallback(() => {
    setRefreshCounter(prev => prev + 1);
  }, []);

  const handlePageChange = (newPage, data = {}) => {
    setCurrentPage(newPage);
    setPageData(data);
    if (newPage === 'community') {
      refreshMessageCount();
    }
  };

  return (
    <MobileLayout>
      <Header title={getPageTitle(currentPage, pageData)} />
      <MainContent>
        {renderPage(currentPage, pageData, handlePageChange, refreshMessageCount)}
      </MainContent>
      <BottomNav 
        currentPage={currentPage} 
        onPageChange={handlePageChange}
        refreshTrigger={refreshCounter}
      />
    </MobileLayout>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router> {/* React Router로 전체 앱 감싸기 */}
          <Routes>
            {/* 홈 경로 */}
            <Route path="/" element={<AppContent />} />
            
            {/* 특정 유저 프로필 페이지 라우팅 */}
            <Route path="/profile/:memberId" element={<SomeoneInfo />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;

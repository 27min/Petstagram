import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from '../../services/authService';

const MyStories = ({ onPageChange }) => {
  const [stories, setStories] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyStories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/stories/my`, {
          headers: authService.getAuthHeader(),
        });

        if (!response.ok) {
          throw new Error('스토리를 불러오는데 실패했습니다.');
        }

        const data = await response.json();
        setStories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMyStories();
  }, []);

  const handleNext = () => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const formatTime = (dateString) => {
    const now = new Date();
    const storyDate = new Date(dateString);
    const diffInHours = Math.floor((now - storyDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - storyDate) / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      return storyDate.toLocaleString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="max-w-md w-full bg-black">
          <p className="text-white text-center">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="max-w-md w-full bg-black">
          <div className="text-white bg-red-500/50 p-4 rounded-lg text-center">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="min-h-screen bg-white flex justify-center items-center">
        <div className="max-w-md w-full bg-black flex flex-col items-center justify-center p-4">
          <p className="text-white mb-4">작성한 스토리가 없습니다.</p>
          <button
            onClick={() => onPageChange('createStory')}
            className="px-4 py-2 bg-blue-500 text-white rounded-full"
          >
            스토리 작성하기
          </button>
        </div>
      </div>
    );
  }

  const currentStory = stories[currentIndex];

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto bg-black relative min-h-screen">
        {/* 헤더 */}
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50 bg-black/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-3">
              <button 
                onClick={() => onPageChange('home')}
                className="text-white"
              >
                <X size={24} />
              </button>
              <div className="flex items-center space-x-2">
                <img
                  src={currentStory.profilePictureUrl || '/api/placeholder/32/32'}
                  alt="Profile"
                  className="w-8 h-8 rounded-full"
                />
                <div>
                  <p className="text-white font-semibold">
                    {currentStory.memberName}
                  </p>
                  <p className="text-white/70 text-xs">
                    {formatTime(currentStory.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 진행 바 */}
          <div className="flex space-x-1 px-4 pb-2">
            {stories.map((_, idx) => (
              <div
                key={idx}
                className="h-0.5 flex-1 rounded-full overflow-hidden bg-white/30"
              >
                <div
                  className={`h-full bg-white ${
                    idx < currentIndex ? 'w-full' :
                    idx === currentIndex ? 'w-full transition-all duration-[15000ms] ease-linear' :
                    'w-0'
                  }`}
                />
              </div>
            ))}
          </div>
        </div>

        {/* 스토리 내용 */}
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          {currentStory.mediaUrl && (
            <div className="w-full mb-4">
              {currentStory.mediaType === 'VIDEO' ? (
                <video 
                  src={currentStory.mediaUrl}
                  className="w-full rounded-lg object-contain max-h-[60vh]"
                  controls
                  autoPlay
                  playsInline
                  muted
                />
              ) : (
                <img
                  src={currentStory.mediaUrl}
                  alt="Story content"
                  className="w-full rounded-lg object-contain max-h-[60vh]"
                />
              )}
            </div>
          )}
          {currentStory.content && (
            <p className="text-white text-center mt-4">
              {currentStory.content}
            </p>
          )}
        </div>

        {/* 네비게이션 버튼 */}
        {currentIndex > 0 && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <button
              onClick={handlePrev}
              className="text-white/50 hover:text-white"
            >
              <ChevronLeft size={40} />
            </button>
          </div>
        )}
        {currentIndex < stories.length - 1 && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <button
              onClick={handleNext}
              className="text-white/50 hover:text-white"
            >
              <ChevronRight size={40} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyStories;
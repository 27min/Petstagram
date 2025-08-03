import React from 'react';
import { Plus } from 'lucide-react';

const StoryProfile = ({ isMyStory, profileImage, username, onPageChange }) => {
  const handleClick = () => {
    if (isMyStory) {
      onPageChange('myStories');
    } else if (onPageChange) {
      // 팔로우한 유저의 스토리 클릭 시에도 onPageChange 실행
      onPageChange();
    }
  };

  const handlePlusClick = (e) => {
    e.stopPropagation();
    onPageChange('createStory');
  };

  return (
    <div className="flex-shrink-0 w-20 flex flex-col items-center">
      <div className="relative mb-1">
        <div 
          onClick={handleClick}
          className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 bg-gray-100 cursor-pointer hover:border-blue-500 transition-colors duration-200"
        >
          {profileImage ? (
            <img 
              src={profileImage} 
              alt={username} 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null; // 추가 에러 방지
                e.target.src = '/default-profile.svg'; // 위에서 만든 SVG 경로
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <img 
                src="/default-profile.svg"
                alt={username}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>
        {isMyStory && (
          <button
            onClick={handlePlusClick}
            className="absolute bottom-0 right-0 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white"
          >
            <Plus size={14} className="text-white" />
          </button>
        )}
      </div>
      <span className="text-xs text-center truncate w-full">
        {isMyStory ? '내 스토리' : username}
      </span>
    </div>
  );
};

export default StoryProfile;
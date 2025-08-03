import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from "../../services/authService";
import StoryProfile from './StoryProfile';
import _ from 'lodash';

const StorySection = ({ memberInfo, followingUsers, onPageChange }) => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 팔로우한 유저들의 스토리 가져오기
  useEffect(() => {
    const fetchStoriesOfFollowingUsers = async () => {
      if (!authService.isAuthenticated() || !memberInfo?.member?.id) return;
      
      setLoading(true);
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/stories/followed`,
          {
            headers: {
              ...authService.getAuthHeader(),
              'Content-Type': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('스토리를 가져오는데 실패했습니다.');

        const allStories = await response.json();

        // ACTIVE 상태인 스토리만 필터링하고 멤버별로 그룹화
        const activeStories = allStories.filter(story => story.status === 'ACTIVE');
        
        // 각 멤버별로 가장 최신 스토리만 선택
        const groupedStories = _.chain(activeStories)
          .groupBy('memberId')
          .map((memberStories) => {
            const latestStory = _.maxBy(memberStories, 'createdAt');
            return {
              ...latestStory,
              totalStories: memberStories.length
            };
          })
          .value();

        setStories(groupedStories);
      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('스토리를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStoriesOfFollowingUsers();
  }, [memberInfo]);

  // Stories 섹션의 스토리 클릭 핸들러
  const handleStoryClick = (memberId, memberName) => {
    onPageChange('viewStory', { 
      memberId,
      memberName
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4">
      <h2 className="text-lg font-semibold mb-2">Stories</h2>
      {error && (
        <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      <div className="flex overflow-x-auto space-x-4 py-2">
        <StoryProfile
          isMyStory={true}
          profileImage={memberInfo?.member?.profilePictureUrl}
          username="내 스토리"
          onPageChange={onPageChange}
        />

        {loading ? (
          <div className="flex-1 flex items-center justify-center min-h-[80px]">
            <p className="text-xs text-gray-500">스토리를 불러오는 중...</p>
          </div>
        ) : stories.length > 0 ? (
          stories.map((story) => (
            <StoryProfile
              key={story.memberId}
              isMyStory={false}
              profileImage={story.profilePictureUrl}
              username={story.memberName}
              onPageChange={() => handleStoryClick(story.memberId, story.memberName)}
            />
          ))
        ) : followingUsers.length > 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[80px]">
            <p className="text-xs text-gray-500">
              팔로우한 사용자의 스토리가 없습니다.
            </p>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center min-h-[80px]">
            <p className="text-xs text-gray-500">
              팔로우한 사용자가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorySection;
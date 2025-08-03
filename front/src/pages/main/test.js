import React, { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from "../../services/authService";
import { memberService } from "../../services/MemberService";
import StoryProfile from '../story/StoryProfile';
import StoryPost from "../story/StoryPost";
import PostForm from "../../components/posts/PostForm";
import PostCard from "../../components/posts/PostCard";
import _ from 'lodash';

const HomePage = ({ onPageChange }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [stories, setStories] = useState([]);
  const [memberInfo, setMemberInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [followingUsers, setFollowingUsers] = useState([]);
  const [error, setError] = useState('');

  // 멤버 정보와 팔로잉 유저 정보 가져오기
  useEffect(() => {
    const initializePage = async () => {
      try {
        const memberData = await memberService.getMemberInfo();
        setMemberInfo(memberData);

        if (memberData?.member?.id) {
          const response = await fetch(
            `${API_BASE_URL}/api/member/${memberData.member.id}/following`, 
            {
              headers: {
                ...authService.getAuthHeader(),
                'Content-Type': 'application/json'
              }
            }
          );

          if (!response.ok) throw new Error('팔로잉 목록을 가져오는데 실패했습니다.');

          const followingData = await response.json();
          setFollowingUsers(followingData);
        }
      } catch (error) {
        console.error('Error initializing page:', error);
        setError(error.message);
      }
    };

    if (authService.isAuthenticated()) {
      initializePage();
    }
  }, []);

  // 팔로우한 유저들의 스토리 가져오기
  useEffect(() => {
    const fetchStoriesOfFollowingUsers = async () => {
      if (!authService.isAuthenticated() || !memberInfo?.member?.id) return;

      try {
        // 팔로우한 유저들의 ACTIVE 상태인 스토리 가져오기
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
            // 각 멤버의 스토리들 중 가장 최신 것을 선택
            const latestStory = _.maxBy(memberStories, 'createdAt');
            return {
              ...latestStory,
              totalStories: memberStories.length // 해당 멤버의 총 스토리 수
            };
          })
          .value();

        console.log('Grouped stories:', groupedStories);
        setStories(groupedStories);

      } catch (error) {
        console.error('Error fetching stories:', error);
        setError('스토리를 불러오는데 실패했습니다.');
      }
    };

    fetchStoriesOfFollowingUsers();
  }, [memberInfo]);

  // 게시글 관련 로직...
  const fetchPosts = useCallback(async () => {
    if (loading) return;
  
    try {
      setLoading(true);
      const size = 10;
      const response = await fetch(
        `${API_BASE_URL}/api/posts/page?page=${page}&size=${size}`, 
        {
          method: "GET",
          headers: {
            ...authService.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );
  
      if (!response.ok) throw new Error("게시물 데이터를 가져오는데 실패했습니다.");
  
      const data = await response.json();
      
      if (data.content && data.content.length > 0) {
        setPosts(prevPosts => {
          const newPosts = [...prevPosts];
          data.content.forEach(post => {
            if (!newPosts.find(p => p.id === post.id)) {
              newPosts.push(post);
            }
          });
          return newPosts;
        });
        
        setHasMore(!data.last);
        setPage(prev => prev + 1);
      } else {
        setHasMore(false);
      }
  
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }, [page, loading]);

  const handlePostSubmitted = async () => {
    try {
      setLoading(true);
      setPosts([]);
      setPage(0);
      setHasMore(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/posts/page?page=0&size=10`, 
        {
          headers: {
            ...authService.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("게시물을 가져오는데 실패했습니다.");

      const data = await response.json();
      
      if (data.content?.length > 0) {
        setPosts(data.content);
        setHasMore(!data.last);
        setPage(1);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setShowPostForm(false);
    }
  };

  // Stories 섹션의 스토리 클릭 핸들러
  const handleStoryClick = (memberId, memberName) => {
    // 해당 멤버의 모든 ACTIVE 스토리를 보여주는 페이지로 이동
    onPageChange('viewStory', { 
      memberId,
      memberName
    });
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Stories 섹션 */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Stories</h2>
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
                onClick={() => handleStoryClick(story.memberId, story.memberName)}
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

      {/* Posts 섹션 */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="text-lg font-semibold mb-2">최신 게시글</h2>
        
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setShowPostForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded mb-0"
          >
            +
          </button>
        </div>

        {showPostForm && (
          <PostForm
            onPostSubmit={handlePostSubmitted}
            onClose={() => setShowPostForm(false)}
          />
        )}

        <InfiniteScroll
          dataLength={posts.length}
          next={fetchPosts}
          hasMore={hasMore}
          loader={
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          }
          endMessage={
            <p className="text-center text-gray-500 p-4">
              새 게시글이 없습니다.
            </p>
          }
          scrollThreshold={0.8}
        >
          {posts.map((post) => (
            <PostCard
              key={post.id}
              memberId={post.memberId}
              memberName={post.memberName}
              content={post.content}
              mediaList={post.mediaList}
              createdAt={post.createdAt}
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default HomePage;
import React, { useState, useEffect, useCallback } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { API_BASE_URL } from "../../config/apiConfig";
import { authService } from "../../services/authService";
import { memberService } from "../../services/MemberService";
import StorySection from '../story/StorySection';
import PostForm from "../../components/posts/PostForm";
import PostCard from "../../components/posts/PostCard";
import { PostService } from "../../services/PostService";

const HomePage = ({ onPageChange }) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
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

  // 게시글 가져오기
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
      setError("게시물을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }, [page]); // loading 제거

  const handlePostLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await PostService.likePost(postId);
      } else {
        await PostService.unlikePost(postId);
      }
      
      // posts 상태 업데이트
      setPosts(prevPosts => prevPosts.map(post => 
        post.id === postId 
          ? { 
              ...post, 
              likeCount: isLiked ? post.likeCount + 1 : post.likeCount - 1,
              liked: isLiked
            } 
          : post
      ));
    } catch (error) {
      console.error('Failed to handle like:', error);
    }
  };
  
  const handlePostComment = async (postId, commentText) => {
    try {
      const response = await PostService.addComment(postId, commentText);
      return response; // 새로 생성된 댓글 데이터 반환
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  // 초기 데이터 로딩
  useEffect(() => {
    const loadInitialPosts = async () => {
      if (page === 0 && authService.isAuthenticated()) {
        await fetchPosts();
      }
    };
    
    loadInitialPosts();
  }, [fetchPosts]);

  // 게시글 등록 후 처리
  const handlePostSubmitted = async () => {
    try {
      setLoading(true);
      setPosts([]);
      setPage(0);
      setHasMore(true);
      
      const response = await fetch(
        `${API_BASE_URL}/api/posts/page?page=0&size=10`,
        {
          method: "GET",
          headers: {
            ...authService.getAuthHeader(),
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) throw new Error("게시물을 가져오는데 실패했습니다.");

      const data = await response.json();
      
      if (data.content && data.content.length > 0) {
        setPosts(data.content);
        setHasMore(!data.last);
        setPage(1);
      } else {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error("Error fetching posts:", error);
      setError("게시물을 새로고침하는데 실패했습니다.");
    } finally {
      setLoading(false);
      setShowPostForm(false);
    }
  };

  return (
    <div className="p-4">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Stories 섹션 */}
      <StorySection 
        memberInfo={memberInfo} 
        followingUsers={followingUsers} 
        onPageChange={onPageChange} 
      />

      {/* 최신 게시글 섹션 */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold mb-2">최신 게시글</h2>
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
              key={post.id}  // React 리스트의 key prop
              postId={post.id}
              memberId={post.memberId}
              memberName={post.memberName}
              content={post.content}
              createdAt={post.createdAt}
              mediaList={post.mediaList}
              initialLikes={post.likeCount}      // 게시물의 초기 좋아요 수
              initialComments={post.comments}     // 게시물의 초기 댓글 목록
              isLiked={post.liked}
              onLike={handlePostLike}            // 좋아요 처리 함수
              onComment={handlePostComment}       // 댓글 처리 함수
              profileUrl={post.profileUrl}  // 게시글 등록자의 프로필 이미지
            />
          ))}
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default HomePage;
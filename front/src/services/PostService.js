import { API_BASE_URL } from "../config/apiConfig";
import { authService } from "./authService";

class PostServiceClass {
  // 게시글 생성
  async createPost(content, mediaUrl, mediaType) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: {
          ...authService.getAuthHeader(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          mediaUrl,
          mediaType,
        }),
      });

      if (!response.ok) {
        throw new Error("게시물 작성에 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  }

  // 내 게시물 조회
  async getMyPosts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/my`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("내 게시물을 불러오는데 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching my posts:", error);
      throw error;
    }
  }

  // 특정 사용자의 게시물 조회
  async getUserPosts(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/user/${userId}`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("사용자의 게시물을 불러오는데 실패했습니다.");
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw error;
    }
  }

  // 게시물 삭제
  async deletePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}`, {
        method: "DELETE",
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("게시물 삭제에 실패했습니다.");
      }

      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  }

  // 좋아요
  async likePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to like post');
      console.log('Liked post:', postId);
      return true;
    } catch (error) {
      console.error('Error liking post:', error);
      throw error;
    }
  }

  async unlikePost(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to unlike post');
      console.log('Unliked post:', postId);
      return true;
    } catch (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  // 좋아요 정보 조회
  async getLikeInfo(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("좋아요 정보를 불러오는데 실패했습니다.");
      }
      const data = await response.json();
      // console.log("Parsed data:", data);
      return data;
    } catch (error) {
      console.error("Error fetching like info:", error);
      throw error;
    }
  }
  
  // 댓글 추가 메서드 구현
  async addComment(postId, content) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (!response.ok) {
        throw new Error('댓글 작성에 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // checkPostLiked 메서드 수정 (response.json() 추가)
  async checkPostLiked(postId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${postId}/like/check`, {
        headers: {
          ...authService.getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error("좋아요 정보를 불러오는데 실패했습니다.");
      }

      return await response.json(); // response 객체가 아닌 실제 데이터를 반환
    } catch (error) {
      console.error('Error checking like:', error);
      throw error;
    }
  }

  
}

// 싱글톤 인스턴스 생성 및 내보내기
export const PostService = new PostServiceClass();

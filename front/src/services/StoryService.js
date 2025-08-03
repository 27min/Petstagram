import { API_BASE_URL } from "../config/apiConfig";
import { authService } from "./authService";

class StoryServiceClass {
  // 스토리 생성
  async createStory(content) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          status: 'ACTIVE'
        }),
      });
      
      if (!response.ok) {
        throw new Error('스토리 작성에 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  }

  // 팔로우한 사용자들의 스토리 조회
  async getFollowedStories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/followed`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('스토리 목록을 불러오는데 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching stories:', error);
      throw error;
    }
  }

  // 내 스토리 목록 조회
  async getMyStories() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/my`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('내 스토리 목록을 불러오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching my stories:', error);
      throw error;
    }
  }

  // 특정 사용자의 스토리 조회
  async getUserStories(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/user/${userId}`, {
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('사용자의 스토리 목록을 불러오는데 실패했습니다.');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user stories:', error);
      throw error;
    }
  }

  // 스토리 삭제
  async deleteStory(storyId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('스토리 삭제에 실패했습니다.');
      }

      return true;
    } catch (error) {
      console.error('Error deleting story:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const StoryService = new StoryServiceClass();
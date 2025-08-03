import { API_BASE_URL } from "../config/apiConfig";
import { authService } from "./authService";
import { socketService } from "./SocketService";

class ChatServiceClass {
  constructor() {
    this.client = null;
    this.subscriptions = new Map(); // 구독 정보를 저장할 Map
  }

  // 채팅방 생성
  async createRoom(roomData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomName: roomData.roomName,
          description: roomData.description,
          roomType: roomData.roomType,
          isActive: roomData.isActive
        }),
      });
      
      if (!response.ok) {
        throw new Error('채팅방 생성에 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  }

  // 채팅방 목록 조회
  async getRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('채팅방 목록을 불러오는데 실패했습니다.');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  }

  // 읽지 않은 모든 채팅 수
  async getMessageCounts() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/message-count`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('읽지 않은 채팅 수를 가져오는데 실패하였습니다.');
      }

      return await response.text();
    } catch(err) {
      console.error('API 통신에 실패하였습니다:', err)
      throw err;
    }
  }

  // 채팅방 참여
  async joinRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/join`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to join chat room');
      }

      return await response.json();
    } catch (error) {
      console.error('Join room error:', error);
      throw error;
    }
  }

  // 채팅방 나가기
  async leaveRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/leave`, {
        method: 'POST',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to leave chat room');
      }

      return await response.json();
    } catch (error) {
      console.error('Leave room error:', error);
      throw error;
    }
  }

  // 채팅방 정보 수정
  async updateRoom(roomId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}`, {
        method: 'PUT',
        headers: {
          ...authService.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to update chat room');
      }

      return await response.json();
    } catch (error) {
      console.error('Update room error:', error);
      throw error;
    }
  }

  // 채팅방 삭제 (호스트만 가능)
  async deleteRoom(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}`, {
        method: 'DELETE',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat room');
      }

      return true;
    } catch (error) {
      console.error('Delete room error:', error);
      throw error;
    }
  }

  // 채팅방 참여자 목록 조회
  async getRoomMembers(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/chat/rooms/${roomId}/members`, {
        method: 'GET',
        headers: {
          ...authService.getAuthHeader()
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get room members');
      }

      return await response.json();
    } catch (error) {
      console.error('Get room members error:', error);
      throw error;
    }
  }

  // 채팅방 검색
  async searchRooms(keyword, page = 0, size = 5) {
    try {
        const params = new URLSearchParams({
            page: page.toString(),
            size: size.toString()
        });
        
        if (keyword) {
            params.append('keyword', keyword);
        }

        const response = await fetch(`${API_BASE_URL}/api/chat/rooms/search?${params}`, {
            method: 'GET',
            headers: {
                ...authService.getAuthHeader()
            }
        });

        if (!response.ok) {
            throw new Error('채팅방 검색에 실패했습니다.');
        }

        return await response.json();
    } catch (error) {
        console.error('Search rooms error:', error);
        throw error;
    }
  }

  // WebSocket 관련 메서드들
  connect(roomId, onMessageCallback, onTypingCallback, onConnectedCallback, onErrorCallback) {
    // 기존 구독이 있다면 모두 해제
    this.disconnect();
    
    // 채팅 메시지 구독
    const messageSubscription = socketService.subscribe(
      `/topic/chat/${roomId}`,
      onMessageCallback
    );

    // 타이핑 알림 구독
    const typingSubscription = socketService.subscribe(
      `/topic/typing/${roomId}`,
      onTypingCallback
    );

    // 구독 정보 저장
    this.subscriptions.set('message', messageSubscription);
    this.subscriptions.set('typing', typingSubscription);

    // Socket 연결
    socketService.connect(onConnectedCallback, onErrorCallback);
  }

  // 연결 해제
  disconnect() {
    // 모든 구독 해제
    for (let subscription of this.subscriptions.values()) {
      if (subscription) {
        socketService.unsubscribe(subscription);
      }
    }
    
    // 구독 정보 초기화
    this.subscriptions.clear();
    
    // Socket 연결 해제
    socketService.disconnect();
  }

  // 메시지 전송
  sendMessage(message) {
    socketService.publish('/app/chat/message', message);
  }

  // 타이핑 상태 전송
  sendTypingStatus(roomId, userId, isTyping) {
    socketService.publish(`/app/typing/${roomId}`, {
      userId,
      isTyping
    });
  }

  async loadRecentMessages(roomId, size = 30) {
    try {
      const url = `${API_BASE_URL}/api/chat/rooms/${roomId}/messages/recent?size=${size}`;
      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }
  
  // 이전 메시지 로드
  async loadPreviousMessages(roomId, lastMessageTime, size = 30) {
    try {
      let url = `${API_BASE_URL}/api/chat/rooms/${roomId}/messages?size=${size}`;
      if (lastMessageTime) {
        url += `&lastMessageTime=${lastMessageTime}`;
      }
      
      const response = await fetch(url, {
        headers: {
          ...authService.getAuthHeader()
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to load messages');
      }
      
      return await response.json(); // { messages: [], hasMore: boolean, lastMessageTime: string }
    } catch (error) {
      console.error('Failed to load messages:', error);
      throw error;
    }
  }
}

// 싱글톤 인스턴스 생성 및 내보내기
export const ChatService = new ChatServiceClass();

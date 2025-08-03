// services/MemberService.js
import { API_BASE_URL } from "../config/apiConfig";
import { authService } from "./authService";

class MemberServiceClass {
    // 내 정보 조회
    async getMemberInfo() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/my`, {
                method: 'GET',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch member info');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching member info:', error);
            throw error;
        }
    }

    // 특정 사용자의 정보 조회
    async getSomeoneInfo(memberId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/${memberId}`, {
                method: 'GET',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch member info');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching member info:', error);
            throw error;
        }
    }

    // 팔로우하기
    async followMember(followingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/follow/${followingId}`, {
                method: 'POST',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to follow member');
            }
            return true;
        } catch (error) {
            console.error('Error following member:', error);
            throw error;
        }
    }

    // 언팔로우하기
    async unfollowMember(followingId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/follow/${followingId}`, {
                method: 'DELETE',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to unfollow member');
            }
            return true;
        } catch (error) {
            console.error('Error unfollowing member:', error);
            throw error;
        }
    }

    // 팔로워 목록 조회
    async getFollowers(memberId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/${memberId}/followers`, {
                method: 'GET',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch followers');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching followers:', error);
            throw error;
        }
    }

    // 팔로잉 목록 조회
    async getFollowing(memberId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/${memberId}/following`, {
                method: 'GET',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch following');
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching following:', error);
            throw error;
        }
    }

    async checkFollowStatus(memberId) {
        try {
            const response = await fetch(`${API_BASE_URL}/api/member/${memberId}/follow-status`, {
                method: 'GET',
                headers: {
                    ...authService.getAuthHeader(),
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error('Failed to check follow status');
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking follow status:', error);
            throw error;
        }
    }
}

export const memberService = new MemberServiceClass();

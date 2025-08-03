import React, { useEffect, useState } from "react";
import { User } from 'lucide-react';
import { memberService } from '../../services/MemberService';
import { CustomButton } from './custom-button.tsx';
import { MemberList } from "./member-list";
import { PetCarousel } from './pet-carousel.tsx';
import { API_BASE_URL } from "../../config/apiConfig";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import './MyPage.css';
import ProfileEditModal from './ProfileEditModal.js';

const ProfilePage = ({ pageData, onPageChange }) => {
  const { logout } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    member: null,
    pets: [],
    follows: { follower: 0, following: 0 },
    isFollowing: false
  });
  const [activeTab, setActiveTab] = useState("pets");
  const [isProcessing, setIsProcessing] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isProfileEditModalOpen, setIsProfileEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // 현재 보고 있는 프로필이 자신의 것인지 확인
  const isOwnProfile = !pageData?.memberId;

  // fetchProfileData 함수를 useEffect 밖으로 이동
  const fetchProfileData = async () => {
    try {
      setIsLoading(true);  // loading 상태 추가
      const headers = {
        ...authService.getAuthHeader(),
        "Content-Type": "application/json",
      };

      // API 엔드포인트 결정
      const endpoint = isOwnProfile 
        ? `${API_BASE_URL}/api/member/my`
        : `${API_BASE_URL}/api/member/${pageData.memberId}`;

      const response = await fetch(endpoint, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (!response.ok) throw new Error("프로필 정보를 가져오는데 실패했습니다.");

      const responseData = await response.json();
      
      setData({
        member: responseData.member,
        pets: Array.isArray(responseData.pets) ? responseData.pets : (responseData.pet ? [responseData.pet] : []),
        follows: responseData.follows || { follower: 0, following: 0 },
        isFollowing: responseData.isFollowing || false
      });

      // followers와 following 데이터 가져오기
      if (!isOwnProfile) {
        const [followersData, followingData] = await Promise.all([
          memberService.getFollowers(pageData.memberId),
          memberService.getFollowing(pageData.memberId)
        ]);
        setFollowers(followersData);
        setFollowing(followingData);
      }

    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect에서는 fetchProfileData를 호출만 합니다
  useEffect(() => {
    fetchProfileData();
  }, [pageData?.memberId, isOwnProfile]);

  const handleFollowClick = async () => {
    if (!data?.member?.id || isProcessing) return;

    setIsProcessing(true);
    try {
      if (data.isFollowing) {
        await memberService.unfollowMember(data.member.id);
        setData(prev => ({ ...prev, isFollowing: false }));
      } else {
        await memberService.followMember(data.member.id);
        setData(prev => ({ ...prev, isFollowing: true }));
      }

      const updatedData = await memberService.getSomeoneInfo(pageData.memberId);
      setData(prev => ({
        ...prev,
        follows: updatedData.follows || { follower: 0, following: 0 }
      }));
    } catch (err) {
      console.error('Error handling follow:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await logout();
      authService.logout();
    } catch (error) {
      setError(error.message || "로그아웃에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberId, memberName) => {
    onPageChange('someoneInfo', {
      memberId: memberId,
      name: memberName
    });
  };

  const handleProfileUpdateSuccess = async () => {
    await fetchProfileData();
    setIsProfileEditModalOpen(false);
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  const stats = [
    {
      label: "반려동물",
      value: data.pets?.length || 0,
      onClick: () => setActiveTab("pets")
    },
    {
      label: "팔로워",
      value: data.follows?.follower || 0,
      onClick: () => setActiveTab("followers")
    },
    {
      label: "팔로잉",
      value: data.follows?.following || 0,
      onClick: () => setActiveTab("following")
    },
  ];

  const tabs = isOwnProfile
    ? [
        { id: "pets", label: "반려동물" },
        { id: "posts", label: "게시물" },
        { id: "saved", label: "저장됨" },
        { id: "tagged", label: "태그됨" },
      ]
    : [
        { id: "pets", label: "반려동물" },
        { id: "posts", label: "게시물" },
      ];

  return (
    <div className="max-w-2xl mx-auto p-4">
      {isOwnProfile && (
        <header className="bg-white border-b mb-6">
          <div className="max-w-4xl mx-auto px-4 h-14 flex justify-between items-center">
            <h1 className="text-xl font-semibold">애니멀 인사이드</h1>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="text-sm text-blue-500 font-medium disabled:opacity-50"
            >
              {loading ? "로그아웃 중..." : "로그아웃"}
            </button>
          </div>
        </header>
      )}

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="shrink-0">
            <div className="h-20 w-20 sm:w-36 sm:h-36 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {data.member?.profilePictureUrl ? (
                <img
                  src={data.member.profilePictureUrl}
                  alt={data.member.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-12 w-12 text-gray-400" />
              )}
            </div>
          </div>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">{data.member?.name}</h2>
            <div className="grid grid-cols-3 gap-4 mb-4 w-full max-w-[400px] mx-auto sm:mx-0">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="text-center cursor-pointer"
                  onClick={stat.onClick}
                >
                  <span className="font-semibold block">{stat.value}</span>
                  <span className="text-sm text-gray-600 block whitespace-nowrap">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-center sm:justify-start mb-4">
              {isOwnProfile ? (
                <CustomButton
                  onClick={() => setIsProfileEditModalOpen(true)}
                  variant="outline"
                  className="w-[200px]"
                >
                  프로필 편집
                </CustomButton>
              ) : (
                <CustomButton
                  onClick={handleFollowClick}
                  disabled={isProcessing}
                  variant={data.isFollowing ? "outline" : "default"}
                  className="w-[200px]"
                >
                  {data.isFollowing ? "언팔로우" : "팔로우"}
                </CustomButton>
              )}
            </div>
          </div>
        </div>

        <div className="border-t">
          <div className={`grid ${isOwnProfile ? 'grid-cols-4' : 'grid-cols-2'} w-full`}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-xs font-medium tracking-wider uppercase text-center ${
                  activeTab === tab.id
                    ? "text-black border-b-2 border-black"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {activeTab === "pets" && (
            <div>
              {data.pets && data.pets.length > 0 ? (
                <PetCarousel pets={data.pets} />
              ) : (
                <div className="text-gray-500 text-center">
                  아직 등록된 반려동물이 없습니다.
                </div>
              )}
            </div>
          )}
          {activeTab === "posts" && (
            <div className="text-center text-sm text-gray-500">
              아직 게시물이 없습니다.
            </div>
          )}
          {activeTab === "followers" && (
            <MemberList 
              members={followers} 
              onMemberClick={handleMemberClick} 
            />
          )}
          {activeTab === "following" && (
            <MemberList 
              members={following} 
              onMemberClick={handleMemberClick} 
            />
          )}
          {activeTab === "saved" && isOwnProfile && (
            <div className="text-center text-sm text-gray-500">
              저장된 항목이 없습니다.
            </div>
          )}
          {activeTab === "tagged" && isOwnProfile && (
            <div className="text-center text-sm text-gray-500">
              태그된 게시물이 없습니다.
            </div>
          )}
        </div>
      </div>

      {isProfileEditModalOpen && (
        <ProfileEditModal 
          memberInfo={data.member} 
          onClose={() => setIsProfileEditModalOpen(false)}
          onUpdate={handleProfileUpdateSuccess}
        />
      )}
    </div>
  );
};

export default ProfilePage;
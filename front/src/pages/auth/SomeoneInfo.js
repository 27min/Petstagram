import { User } from 'lucide-react';
import React, { useCallback, useEffect, useState } from 'react';
import { memberService } from '../../services/MemberService';
import { CustomButton } from './custom-button.tsx';
import { MemberList } from "./member-list";
import { PetCarousel } from './pet-carousel.tsx';

const SomeoneInfo = ({ pageData, onPageChange }) => {
    const [data, setData] = useState({
        member: null,
        pets: [],
        follows: { follower: 0, following: 0 },
        isFollowing: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState("pets");
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);

    // 초기 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            if (!pageData?.memberId) return;

            try {
                // 기본 정보 가져오기
                const response = await memberService.getSomeoneInfo(pageData.memberId);
                setData({
                    member: response.member,
                    pets: Array.isArray(response.pet) ? response.pet : (response.pet ? [response.pet] : []),
                    follows: response.follows || { follower: 0, following: 0 },
                    isFollowing: response.isFollowing || false,
                });
                
                // followers와 following 데이터 가져오기 및 팔로우 상태 확인
                const [followersData, followingData] = await Promise.all([
                    memberService.getFollowers(pageData.memberId),
                    memberService.getFollowing(pageData.memberId)
                ]);

                // 팔로우 상태 확인 및 설정
                const followersWithStatus = await Promise.all(
                    followersData.map(async (member) => {
                        try {
                            const memberInfo = await memberService.getSomeoneInfo(member.id);
                            return { ...member, isFollowing: memberInfo.isFollowing || false };
                        } catch (err) {
                            return { ...member, isFollowing: false };
                        }
                    })
                );

                const followingWithStatus = await Promise.all(
                    followingData.map(async (member) => {
                        try {
                            const memberInfo = await memberService.getSomeoneInfo(member.id);
                            return { ...member, isFollowing: memberInfo.isFollowing || false };
                        } catch (err) {
                            return { ...member, isFollowing: false };
                        }
                    })
                );
                
                setFollowers(followersWithStatus);
                setFollowing(followingWithStatus);
                
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [pageData?.memberId]);

    // 팔로우/언팔로우 처리
    const handleFollowToggle = async (memberId) => {
        setIsProcessing(true);

        const updateFollowStatus = (list) =>
            list.map((m) =>
                m.id === memberId ? { ...m, isFollowing: !m.isFollowing } : m
            );

        // 로컬 상태 즉시 업데이트
        setFollowers(updateFollowStatus);
        setFollowing(updateFollowStatus);

        try {
            const memberToUpdate = [...followers, ...following].find((m) => m.id === memberId);
            if (!memberToUpdate) return;

            if (memberToUpdate.isFollowing) {
                await memberService.unfollowMember(memberId);
            } else {
                await memberService.followMember(memberId);
            }
        } catch (err) {
            console.error("Error toggling follow status:", err);
            // 실패 시 상태 복구
            setFollowers(updateFollowStatus);
            setFollowing(updateFollowStatus);
        } finally {
            setIsProcessing(false);
        }
    };

    // 프로필 팔로우/언팔로우
    const handleFollowClick = async () => {
        if (!data?.member?.id || isProcessing) return;

        setIsProcessing(true);
        try {
            setData((prev) => ({
                ...prev,
                isFollowing: !prev.isFollowing,
            }));

            if (data.isFollowing) {
                await memberService.unfollowMember(data.member.id);
            } else {
                await memberService.followMember(data.member.id);
            }
        } catch (err) {
            console.error("Error handling follow:", err);
            setData((prev) => ({
                ...prev,
                isFollowing: !prev.isFollowing,
            }));
        } finally {
            setIsProcessing(false);
        }
    };

    const handleMemberClick = (memberId, memberName) => {
        onPageChange('someoneInfo', {
            memberId: memberId,
            name: memberName
        });
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

    const navigationTabs = [
        { id: "pets", label: "반려동물" },
        { id: "posts", label: "게시물" }
    ];

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="bg-white rounded-lg shadow-lg">
                {/* Profile section */}
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
                            <CustomButton
                                onClick={handleFollowClick}
                                disabled={isProcessing}
                                variant={data.isFollowing ? "outline" : "default"}
                                className="w-[200px]"
                            >
                                {data.isFollowing ? "팔로잉" : "팔로우"}
                            </CustomButton>
                        </div>
                    </div>
                </div>

                {/* Navigation tabs */}
                <div className="border-t">
                    <div className="grid grid-cols-2 w-full">
                        {navigationTabs.map((tab) => (
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

                {/* Content section */}
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
                            onFollowToggle={handleFollowToggle}
                        />
                    )}
                    {activeTab === "following" && (
                        <MemberList 
                            members={following}
                            onMemberClick={handleMemberClick}
                            onFollowToggle={handleFollowToggle}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SomeoneInfo;
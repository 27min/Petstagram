package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.team.ain.dto.MemberResponse;

@Mapper
public interface FollowersMapper {
    void follow(Long followerId, Long followingId);
    void unfollow(Long followerId, Long followingId);
    boolean isFollowing(Long followerId, Long followingId);
    long getFollowerIds(Long memberId);
    int getFollowersCount(Long memberId);
    int getFollowingCount(Long memberId);

    
    List<MemberResponse> getFollowers(Long memberId);
    
    List<MemberResponse> getFollowing(Long memberId);
}

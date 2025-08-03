package com.team.ain.service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.team.ain.dto.MemberResponse;
import com.team.ain.mapper.FollowersMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FollowerService {
    private final FollowersMapper followersMapper;

    // 팔로우 추가
    public void follow(Long followerId, Long followingId) {
        if (!followersMapper.isFollowing(followerId, followingId)) {
            followersMapper.follow(followerId, followingId);
        }
    }

    // 팔로우 삭제
    public void unfollow(Long followerId, Long followingId) {
        if (followersMapper.isFollowing(followerId, followingId)) {
            followersMapper.unfollow(followerId, followingId);
        }
    }

    // 팔로워 / 팔로잉 수 체크
    public Map<String, Integer> checkFollwers(Long memberId) {
        Map<String, Integer> followers = new HashMap<>();
        followers.put("follower", followersMapper.getFollowersCount(memberId));
        followers.put("following", followersMapper.getFollowingCount(memberId));
        return followers;
    }

    // 팔로우 체크
    public boolean isFollowing(Long followerId, Long followingId) {
        return followersMapper.isFollowing(followerId, followingId);
    }

    // 팔로워 목록 조회
    public List<MemberResponse> getFollowers(Long memberId) {
        return followersMapper.getFollowers(memberId);
    }

    // 팔로잉 목록 조회
    public List<MemberResponse> getFollowing(Long memberId) {
        return followersMapper.getFollowing(memberId);
    }
}

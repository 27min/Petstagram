package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import com.team.ain.dto.story.StoryDTO;

@Mapper
public interface StoryMapper {
    // 스토리 생성
    void insertStory(StoryDTO story);
    
    // 모든 활성 스토리 조회
    List<StoryDTO> findAllActiveStories();
    
    // 특정 회원의 스토리 조회
    List<StoryDTO> findStoriesByMemberId(@Param("memberId") Long memberId);
    
    // 특정 회원의 24시간 이내 스토리 조회
    List<StoryDTO> findRecentStoriesByMemberId(@Param("memberId") Long memberId);

    // 팔로우한 멤버들의 스토리 조회
    List<StoryDTO> findFollowedMemberStories(@Param("memberId") Long memberId);

    // 만료된 스토리 상태 업데이트
    int updateExpiredStories();
}
package com.team.ain.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.team.ain.dto.story.StoryDTO;
import com.team.ain.mapper.StoryMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StoryService {
    private final StoryMapper storyMapper;
    private final MemberService memberService;

    // 스토리 생성
    public void createStory(StoryDTO storyDTO) {
        // content와 mediaUrl 둘 다 없는 경우에만 에러
        if ((storyDTO.getContent() == null || storyDTO.getContent().trim().isEmpty()) 
            && (storyDTO.getMediaUrl() == null || storyDTO.getMediaUrl().trim().isEmpty())) {
            throw new IllegalArgumentException("스토리 내용이나 미디어 파일을 입력해주세요.");
        }

        // 멤버 존재 여부 확인
        memberService.findNameAndProfileUrlById(storyDTO.getMemberId());
        
        // 스토리 저장
        storyMapper.insertStory(storyDTO);
    }

    // 활성화된 모든 스토리 조회
    public List<StoryDTO> getAllActiveStories() {
        return storyMapper.findAllActiveStories();
    }

    // 특정 회원의 스토리 조회
    public List<StoryDTO> getMemberStories(Long memberId) {
        return storyMapper.findStoriesByMemberId(memberId);
    }

    // 특정 회원의 24시간 이내 스토리 조회
    public List<StoryDTO> getRecentMemberStories(Long memberId) {
        return storyMapper.findRecentStoriesByMemberId(memberId);
    }

    // 만료된 스토리 상태 업데이트
    public int updateExpiredStories() {
        return storyMapper.updateExpiredStories();
    }

    public List<StoryDTO> getFollowedMemberStories(Long memberId) {
        return storyMapper.findFollowedMemberStories(memberId);
    }
}
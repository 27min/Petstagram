package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.springframework.data.repository.query.Param;

import com.team.ain.dto.story.StoryCommentDTO;

@Mapper
public interface StoryCommentMapper {
    // 댓글 생성
    void insertComment(StoryCommentDTO comment);
    
    // 스토리의 모든 댓글 조회 (대댓글 제외)
    List<StoryCommentDTO> findCommentsByStoryId(@Param("storyId") Long storyId);
    
    // 특정 댓글의 대댓글 조회
    List<StoryCommentDTO> findRepliesByCommentId(@Param("commentId") Long commentId);
    
    // 댓글 삭제 (상태 변경)
    void deleteComment(@Param("commentId") Long commentId, @Param("memberId") Long memberId);
    
    // 특정 댓글 상세 조회
    StoryCommentDTO findCommentById(@Param("commentId") Long commentId);
    
    // 특정 스토리의 총 댓글 수 조회
    int countCommentsByStoryId(@Param("storyId") Long storyId);
    
    // 특정 댓글의 답글 수 조회
    int countRepliesByCommentId(@Param("commentId") Long commentId);
    
    // 특정 멤버의 댓글 조회
    List<StoryCommentDTO> findCommentsByMemberId(@Param("memberId") Long memberId);
}
package com.team.ain.dto.story;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class StoryCommentDTO {
    private Long id;
    private Long storyId;
    private Long memberId;
    private Long parentId;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;

    private String memberName;
    private String profilePictureUrl;
    private List<StoryCommentDTO> replies; // 대댓글 목록
    private int replyCount; // 대댓글 수

}

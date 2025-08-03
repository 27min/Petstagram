package com.team.ain.dto.story;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StoryDTO {
    private Long id;
    private Long memberId;
    private String content;
    private String mediaUrl;
    private String mediaType;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
    private String status;
    
    // 조회시 추가 정보
    private String memberName;
    private String profilePictureUrl;
}

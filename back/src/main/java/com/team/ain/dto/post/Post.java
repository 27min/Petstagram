package com.team.ain.dto.post;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Data;

@Data
public class Post {
    private Long id;
    private Long memberId;
    private String memberName;
    private String profileUrl;
    private String content;
    private Long likeCount;
    private boolean isLiked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<PostMedia> mediaList; // 추가된 부분
    private List<Comment> comments; // 추가된 부분
}
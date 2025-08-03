package com.team.ain.dto.post;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PostLike {
    private Long id;
    private Long postId;
    private Long likeCount;
    private boolean isLiked;
    private Long memberId;
    private LocalDateTime createdAt;
}

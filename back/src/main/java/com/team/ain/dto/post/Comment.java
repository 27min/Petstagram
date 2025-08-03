package com.team.ain.dto.post;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Comment {
    private Long id;
    private Long postId;
    private Long memberId;
    private String memberName;
    private String content;
    private LocalDateTime createdAt;
}

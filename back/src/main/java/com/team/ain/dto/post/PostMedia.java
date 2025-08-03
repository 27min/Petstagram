package com.team.ain.dto.post;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class PostMedia {
    private Long id;
    private Long postId;
    private String mediaUrl;
    private String mediaType;
    private Integer displayOrder;
    private LocalDateTime createdAt;
}
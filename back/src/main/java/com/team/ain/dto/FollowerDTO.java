package com.team.ain.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class FollowerDTO {
    private Long followerId;
    private Long followingId;
    private LocalDateTime createdAt;
}
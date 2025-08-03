package com.team.ain.dto.chat;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MessageReadDTO {
    private Long roomId;
    private Long memberId;
    private LocalDateTime readAt;
}

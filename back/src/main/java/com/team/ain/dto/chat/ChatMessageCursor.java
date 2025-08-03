package com.team.ain.dto.chat;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ChatMessageCursor {
    private LocalDateTime lastMessageTime;
    private int pageSize;
}

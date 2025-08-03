package com.team.ain.dto.chat;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class ChatMessagePageResponse {
    private List<ChatMessageDTO> messages;
    private boolean hasMore;
    private LocalDateTime lastMessageTime;
}

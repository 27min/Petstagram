package com.team.ain.dto.chat;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMember {
    private Long roomId;

    private Long memberId;

    private LocalDateTime joinedAt;

    private LocalDateTime lastReadAt;
}
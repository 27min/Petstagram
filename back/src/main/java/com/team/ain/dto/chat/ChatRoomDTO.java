package com.team.ain.dto.chat;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ChatRoomDTO {
    private Long id;
    private String roomName;
    private boolean roomType;  // true: 오픈채팅, false: 1:1채팅
    private Long hostId;
    private LocalDateTime createdAt;
    private boolean isActive;
    private int memberCount;  // 채팅방 참여자 수
    private Integer unreadCount;
    private LocalDateTime lastMessageTime;  // 마지막 메시지 시간 추가
    private String lastMessage;             // 마지막 메시지 내용 추가
    private Boolean isPrivate;              // 방 타입 (private/public)
}
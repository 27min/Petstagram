package com.team.ain.dto.chat;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ChatMessageDTO {
    private Long id;
    private Long roomId;
    private Long senderId;
    private String messageType;  // TEXT, IMAGE, FILE
    private String content;
    private String senderName;      // sender_name이 이 필드로 매핑되어야 함
    private String senderProfileUrl; // sender_profile_url이 이 필드로 매핑되어야 함
    private LocalDateTime createdAt;
    private boolean isDeleted;
    private String fileUrl;
    private String fileName;
    private Integer fileSize;
}
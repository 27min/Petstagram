package com.team.ain.dto.notice;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NotificationDTO {
    private Long id;
    private Long recipientId;
    private Long senderId;
    private String senderName;
    private NotificationType notificationType;
    private String content;
    private Long relatedId;
    private boolean isRead;
    private LocalDateTime createdAt;
}

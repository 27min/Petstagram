package com.team.ain.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.team.ain.dto.auth.Member;
import com.team.ain.dto.notice.NotificationDTO;
import com.team.ain.dto.notice.NotificationType;
import com.team.ain.mapper.ChatRoomMapper;
import com.team.ain.mapper.MemberMapper;
import com.team.ain.mapper.NotificationMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationMapper notificationMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomMapper chatRoomMapper;
    private final MemberMapper memberMapper;

    public void createMessageNotification(Long roomId, Long senderId, String content) {
        Member sender = memberMapper.findById(senderId)
            .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        List<Long> recipients = chatRoomMapper.findMembersByRoomId(roomId)
            .stream()
            .filter(memberId -> !memberId.equals(senderId))
            .collect(Collectors.toList());

        for (Long recipientId : recipients) {
            NotificationDTO notification = NotificationDTO.builder()
                .recipientId(recipientId)
                .senderId(senderId)
                .senderName(sender.getName())  // 발신자 이름 추가
                .notificationType(NotificationType.NEW_MESSAGE)
                .content(content)
                .relatedId(roomId)
                .createdAt(LocalDateTime.now())  // 생성 시간 추가
                .build();
            
            
            // 실시간 알림 전송
            messagingTemplate.convertAndSendToUser(
                recipientId.toString(),
                "/queue/notifications",
                notification
            );
        }
    }

    // 읽지 않은 알림 조회
    public List<NotificationDTO> getUnreadNotifications(Long userId) {
        return notificationMapper.getUnreadNotifications(userId);
    }

    public void readRoomMessage(Long roomId, Long userId) {
        notificationMapper.markChatNotificationsAsRead(roomId, userId);
    }
    
    public void markAsRead(Long userId, List<Long> notificationIds) {
        notificationMapper.markNotificationsAsRead(userId, notificationIds);
    }

    public int getUnreadCount(Long userId) {
        return notificationMapper.getUnreadCount(userId);
    }

    private void sendRealTimeNotification(Long userId, NotificationDTO notification) {
        messagingTemplate.convertAndSendToUser(
            userId.toString(),
            "/queue/notifications",
            notification
        );
    }
    
}

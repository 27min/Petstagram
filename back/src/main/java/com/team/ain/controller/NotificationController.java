package com.team.ain.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import com.team.ain.config.jwt.JwtTokenProvider;
import com.team.ain.dto.notice.NotificationDTO;
import com.team.ain.service.NotificationService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Controller
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    private final NotificationService notificationService;
    private final JwtTokenProvider jwtTokenProvider;
    private final SimpMessageSendingOperations messagingTemplate;

    @GetMapping("/unread")
    @ResponseBody
    public ResponseEntity<List<NotificationDTO>> getUnreadNotifications(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/count")
    @ResponseBody
    public ResponseEntity<Integer> getUnreadCount(HttpServletRequest request) {
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    @PutMapping("/read")
    @ResponseBody
    public ResponseEntity<Void> markAsRead(HttpServletRequest request, @RequestBody List<Long> notificationIds) {
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        notificationService.markAsRead(userId, notificationIds);
        return ResponseEntity.ok().build();
    }

    // 읽지 않은 알림 목록 조회
    @MessageMapping("/notifications/unread")
    public void getUnreadNotifications(Principal principal) {
        if (principal == null) {
            log.error("User principal is null");
            return;
        }
        Long userId = Long.parseLong(principal.getName());
        List<NotificationDTO> unreadNotifications = 
            notificationService.getUnreadNotifications(userId);
        
        unreadNotifications.forEach(noti -> {
        log.info("Notification Detail - Id: {}, Type: {}, Content: {}, Created: {}",
            noti.getId(), noti.getNotificationType(), noti.getContent(), noti.getCreatedAt());
        });
            
        messagingTemplate.convertAndSendToUser(
            principal.getName(),
            "/queue/notifications",
            unreadNotifications
        );
    }
}

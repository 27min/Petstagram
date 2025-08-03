package com.team.ain.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.ain.config.jwt.JwtTokenProvider;
import com.team.ain.dto.chat.ChatMessageCursor;
import com.team.ain.dto.chat.ChatMessageDTO;
import com.team.ain.dto.chat.ChatMessagePageResponse;
import com.team.ain.dto.chat.ChatRoomDTO;
import com.team.ain.dto.chat.MessageReadDTO;
import com.team.ain.service.ChatService;
import com.team.ain.service.NotificationService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {
    
    private final ChatService chatService;
    private final JwtTokenProvider jwtTokenProvider;
    private final NotificationService notificationService;
    private final SimpMessageSendingOperations messagingTemplate;
    
    // 채팅방 생성
    @PostMapping("/rooms")
    public ResponseEntity<ChatRoomDTO> createRoom(
            @RequestBody ChatRoomDTO roomDTO,
            HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        roomDTO.setHostId(memberId);
        ChatRoomDTO createdRoom = chatService.createRoom(roomDTO);
        return ResponseEntity.ok(createdRoom);
    }
    
    // 채팅방 목록 조회
    @GetMapping("/rooms")
    public ResponseEntity<List<ChatRoomDTO>> getRooms(HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        List<ChatRoomDTO> rooms = chatService.getUserRooms(memberId);
        return ResponseEntity.ok(rooms);
    }

    // 읽지 않은 모든 채팅 수 조회
    @GetMapping("/message-count")
    public ResponseEntity<Integer> getAllMessageCount(HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        Integer counts = chatService.getMessageCounts(memberId);
        return ResponseEntity.ok(counts);
    }
    

    @GetMapping("/rooms/search")
    public ResponseEntity<?> searchRooms(
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        System.out.println("keyword : " + keyword + "page : " + page + "size : " + size);
        try {
            Page<ChatRoomDTO> rooms = chatService.searchRooms(keyword, PageRequest.of(page, size));
            return ResponseEntity.ok(rooms);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("채팅방 검색 중 오류가 발생했습니다.");
        }
    }
    
    // WebSocket을 통한 채팅 메시지 처리
    @MessageMapping("/chat/message")
    public void handleChatMessage(@Payload ChatMessageDTO message) {
        // 1. 메시지 저장
        ChatMessageDTO savedMessage = chatService.saveAndSendMessage(message);
        
        // 2. 채팅방 전체에 메시지 브로드캐스트
        messagingTemplate.convertAndSend("/topic/chat/" + message.getRoomId(), savedMessage);
        
        // 3. 발신자를 제외한 채팅방 참여자들에게 한 번만 알림 전송
        notificationService.createMessageNotification(message.getRoomId(), message.getSenderId(), message.getContent());
    }

    // 메시지 읽음 상태 업데이트를 위한 새로운 엔드포인트 추가
    @MessageMapping("/chat/read")
    public void handleMessageRead(@Payload MessageReadDTO readEvent) {
        chatService.updateLastReadAt(readEvent.getRoomId(), readEvent.getMemberId());
        
        // 읽음 상태 변경 알림
        messagingTemplate.convertAndSendToUser(
            readEvent.getMemberId().toString(),
            "/queue/read-status",
            readEvent
        );
    }
    
    @PostMapping("/rooms/{roomId}/join")
    public ResponseEntity<?> joinRoom(@PathVariable Long roomId, HttpServletRequest request) {
        try {
            // 현재 사용자 ID 가져오기
            Long userId = jwtTokenProvider.getMemberIdFromRequest(request);

            // 서비스를 통해 채팅방 참여 처리
            chatService.joinRoom(roomId, userId);

            // 채팅방 정보 조회
            ChatRoomDTO room = chatService.getRoomById(roomId);
            
            // 응답 데이터 구성
            Map<String, Object> response = new HashMap<>();
            response.put("roomId", room.getId());
            response.put("roomName", room.getRoomName());
            response.put("joinedAt", LocalDateTime.now());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(("Failed to join chat room: " + e.getMessage()));
        }
    }

    // @GetMapping("/rooms/{roomId}/messages")
    // public ResponseEntity<List<ChatMessageDTO>> getRoomMessages(
    //         @PathVariable Long roomId, HttpServletRequest request) {
    //     Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
    //     List<ChatMessageDTO> messages = chatService.getRoomMessages(roomId, userId);
    //     notificationService.readRoomMessage(roomId, userId);
    //     return ResponseEntity.ok(messages);
    // }

    @GetMapping("/rooms/{roomId}/messages/recent")
    public ResponseEntity<ChatMessagePageResponse> getRecentMessage(
            @PathVariable Long roomId,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        ChatMessagePageResponse response = chatService.getRoomMessages(
            roomId, 
            userId,
            ChatMessageCursor.builder()
                .pageSize(size)
                .build()
        );
        notificationService.readRoomMessage(roomId, userId);
        System.out.println("GetRecentMessage > lastMessageTime : " + response.getLastMessageTime());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatMessagePageResponse> getRoomMessages(
            @PathVariable Long roomId,
            @RequestParam(required = false) LocalDateTime lastMessageTime,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        
        ChatMessagePageResponse response = chatService.getRoomMessages(
            roomId, 
            userId,
            ChatMessageCursor.builder()
                .lastMessageTime(lastMessageTime)
                .pageSize(size)
                .build()
        );
        
        // 메시지 읽음 처리
        notificationService.readRoomMessage(roomId, userId);
        System.out.println("getRoomMessages > lastMessageTime : " + response.getLastMessageTime());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/rooms/{roomId}/leave")
    public ResponseEntity<?> leaveRoom(@PathVariable Long roomId, HttpServletRequest request) {
        Long userId = jwtTokenProvider.getMemberIdFromRequest(request);
        chatService.leaveRoom(roomId, userId);
        
        Map<String, String> response = new HashMap<>();
        response.put("message", "채팅방을 나갔습니다.");
        return ResponseEntity.ok(response);
    }
    
}
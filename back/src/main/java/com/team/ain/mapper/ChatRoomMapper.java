package com.team.ain.mapper;

import java.util.List;
import java.util.Optional;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.team.ain.dto.chat.ChatMember;
import com.team.ain.dto.chat.ChatRoomDTO;

@Mapper
public interface ChatRoomMapper {
    void insertRoom(ChatRoomDTO room);
    void addRoomMember(Long roomId, Long userId);
    boolean isRoomMember(Long roomId, Long userId);
    ChatRoomDTO findRoomById(Long romeId);
    void readChatRoom(Long roomId, Long memberId);
    void leaveChatRoom(ChatMember chatMember);

    // 채팅방 목록 가져오기 + 읽지 않은 알림 수
    List<ChatRoomDTO> getUserRooms(Long memberId);

    // 채팅방 멤버의 Id가져오기
    List<Long> findMembersByRoomId(Long roomId);

    // chatMember 가져오기
    List<ChatMember> findByRoomId(Long roomId);
    Optional<ChatMember> findByRoomIdAndMemberId(Long roomId, Long memberId);
    void save(ChatMember chatMember);


    
    // 페이징 관련 메서드들의 파라미터 타입을 명확하게 지정
    List<ChatRoomDTO> findByRoomNameContainingIgnoreCaseAndIsActiveTrue(
        @Param("keyword") String keyword,
        @Param("offset") int offset,
        @Param("size") int size
    );
    
    List<ChatRoomDTO> findAllByIsActiveTrue(
        @Param("offset") int offset,
        @Param("size") int size
    );
    
    long countByRoomNameContainingIgnoreCaseAndIsActiveTrue(@Param("keyword") String keyword);
    long countAllByIsActiveTrue();
}
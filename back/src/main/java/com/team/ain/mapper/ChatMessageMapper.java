package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.team.ain.dto.chat.ChatMessageCursor;
import com.team.ain.dto.chat.ChatMessageDTO;

@Mapper
public interface ChatMessageMapper {
    void insertMessage(ChatMessageDTO message);
    List<ChatMessageDTO> findMessagesByRoomId(Long roomId);
    Integer getMessageCounts(Long userId);
    int countUnreadMessages(Long memberId);
    List<ChatMessageDTO> findMessagesWithCursor(Long roomId, ChatMessageCursor cursor);
    List<ChatMessageDTO> findRecentMessages(Long roomId, int size);
}
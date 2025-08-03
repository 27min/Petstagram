package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.team.ain.dto.notice.NotificationDTO;

@Mapper
public interface NotificationMapper {
    void createNotification(NotificationDTO notification);
    List<NotificationDTO> getUnreadNotifications(Long userId);
    void markNotificationsAsRead(@Param("userId") Long userId, @Param("notificationIds") List<Long> notificationIds);
    int getUnreadCount(Long userId);
    void markChatNotificationsAsRead(Long roomId, Long userId);
}

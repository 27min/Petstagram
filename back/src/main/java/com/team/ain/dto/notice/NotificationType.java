package com.team.ain.dto.notice;

import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationType {
    NEW_MESSAGE,
    NEW_FOLLOWER,
    NEW_LIKE,
    NEW_COMMENT,
    SYSTEM_NOTICE;

    @JsonValue
    public String getValue() {
        return name();
    }
}

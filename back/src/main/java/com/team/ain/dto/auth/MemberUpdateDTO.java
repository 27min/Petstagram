package com.team.ain.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MemberUpdateDTO {
    private String name;
    private String phoneNumber;
    private String password;
    private String profilePictureUrl;
}

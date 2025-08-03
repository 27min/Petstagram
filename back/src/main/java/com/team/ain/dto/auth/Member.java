package com.team.ain.dto.auth;

import java.util.Date;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Member {
    private Long id;
    private String name;
    private String email;
    private String password;
    private String phoneNumber;
    private String profilePictureUrl;
    private Date createdAt;
}

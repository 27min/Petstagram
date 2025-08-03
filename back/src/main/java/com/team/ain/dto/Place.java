package com.team.ain.dto;

import lombok.Data;

@Data
public class Place {

    private Long id;
    private int categoryId;        // 카테고리 ID
    private String categoryName;    //카테고리 이름
    private String name;            // 장소 이름
    private String address;         // 장소 주소
    private Double latitude;        // 위도
    private Double longitude;      // 경도
    private String description;     // 장소 설명
    private String createdAt;
}

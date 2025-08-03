package com.team.ain.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.team.ain.dto.Place;

@Mapper
public interface PlaceMapper {

    // 생성
    void insertPlace(Place place);

    // ID로 조회
    Place selectPlaceById(Long id);

    // 전체 조회
    List<Place> selectAllPlaces();

    // 수정
    void updatePlace(Place place);

    // 삭제
    void deletePlace(Long id);
    
}

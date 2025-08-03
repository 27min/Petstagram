package com.team.ain.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.ain.dto.Place;
import com.team.ain.service.PlaceService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/place")
@RequiredArgsConstructor
public class PlaceController {

    private final PlaceService placeService;

    // 생성
    @PostMapping
    public ResponseEntity<String> createPlace(@RequestBody Place place) {
        placeService.addPlace(place);  
        return ResponseEntity.ok("장소 등록에 성공했습니다!");
    }
    
    // ID로 조회
    @GetMapping("/{id}")
    public ResponseEntity<Place> getPlaceById(@PathVariable Long id) {
        Place place = placeService.getPlaceById(id);
        return ResponseEntity.ok(place);
    }

    // 전체 조회
    @GetMapping
    public ResponseEntity<List<Place>> getAllPlaces() {
        List<Place> places = placeService.getAllPlaces();
        return ResponseEntity.ok(places);
    }

    // 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updatePlace(@PathVariable Long id, @RequestBody Place place) {
        place.setId(id);
        placeService.updatePlace(place);       
        return ResponseEntity.ok("장소 정보 수정이 완료되었습니다.");
    }
    
    // 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePlace(@PathVariable Long id) {
        placeService.deletePlace(id);
        return ResponseEntity.ok("장소 정보 삭제가 완료되었습니다.");
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyPlaces(
            @RequestParam String query,
            @RequestParam Double latitude,
            @RequestParam Double longitude,
            @RequestHeader("Authorization") String authHeader) {
        
        try {
            // 인증 검증 로직은 그대로 유지
            
            List<Place> places = placeService.searchNearbyPlaces(query, latitude, longitude);
            
            if (places.isEmpty()) {
                return ResponseEntity
                    .ok()
                    .body(Map.of("message", "검색 결과가 없습니다.", "places", places));
            }
            
            return ResponseEntity.ok(places);
            
        } catch (Exception e) {
            log.error("Failed to search nearby places", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "주변 장소 검색 중 오류가 발생했습니다."));
        }
    }

    // Service에서 발생할 수 있는 특정 예외들을 처리하기 위한 Exception Handler
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        log.error("Runtime error occurred: ", e);
        return ResponseEntity
            .status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(Map.of("error", e.getMessage()));
    }
}


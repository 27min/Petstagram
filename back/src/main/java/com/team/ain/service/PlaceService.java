package com.team.ain.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.team.ain.dto.Place;
import com.team.ain.mapper.PlaceMapper;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j 
public class PlaceService {

    private final Dotenv dotenv = Dotenv.load(); // .env 파일 로드
    private final String clientId = dotenv.get("NAVER_CLIENT_ID"); // NAVER_CLIENT_ID 값 로드
    private final String clientSecret = dotenv.get("NAVER_CLIENT_SECRET"); // NAVER_CLIENT_SECRET 값 로드

    // @Value("${naver.client.id}")
    // private String clientId;
    
    // @Value("${naver.client.secret}")
    // private String clientSecret;
    
    private final RestTemplate restTemplate;
    private final PlaceMapper placeMapper;

    // 생성 
    public void addPlace(Place place) {
        placeMapper.insertPlace(place);
    }

    // ID로 조회 
    public Place getPlaceById(Long id) {
        return placeMapper.selectPlaceById(id);
    }

    // 전체 조회 
    public List<Place> getAllPlaces() {
        return placeMapper.selectAllPlaces();
    }

    // 수정 
    public void updatePlace(Place place) {
        placeMapper.updatePlace(place);
    }

    // 삭제 
    public void deletePlace(Long id) {
        placeMapper.deletePlace(id);
    }

    public List<Place> searchNearbyPlaces(String query, Double latitude, Double longitude) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("X-Naver-Client-Id", clientId);
            headers.set("X-Naver-Client-Secret", clientSecret);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            String url = UriComponentsBuilder
                .fromHttpUrl("https://openapi.naver.com/v1/search/local.json")
                .queryParam("query", query)
                .queryParam("coordinate", longitude + "," + latitude)
                .queryParam("radius", 2000)  // 2km 반경
                .build()
                .toUriString();
            
            ResponseEntity<Map> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                Map.class
            );
            
            Map<String, Object> responseBody = response.getBody();
            List<Map<String, Object>> items = (List<Map<String, Object>>) responseBody.get("items");
            
            return items.stream()
                .map(item -> {
                    Place place = new Place();
                    place.setName(((String) item.get("title")).replaceAll("<[^>]*>", ""));  // HTML 태그 제거
                    place.setAddress((String) item.get("address"));
                    place.setLatitude(Double.parseDouble((String) item.get("mapy")));
                    place.setLongitude(Double.parseDouble((String) item.get("mapx")));
                    place.setDescription((String) item.get("category"));
                    return place;
                })
                .collect(Collectors.toList());
                
        } catch (Exception e) {
            log.error("Failed to search nearby places", e);
            throw new RuntimeException("주변 장소 검색에 실패했습니다", e);
        }
    }
}
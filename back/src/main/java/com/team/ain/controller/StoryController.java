package com.team.ain.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.team.ain.config.jwt.JwtTokenProvider;
import com.team.ain.dto.story.StoryDTO;
import com.team.ain.dto.story.StoryRequest;
import com.team.ain.service.S3Service;
import com.team.ain.service.StoryService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/stories")
@RequiredArgsConstructor
public class StoryController {
    private final StoryService storyService;
    private final S3Service s3Service;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping
    public ResponseEntity<?> createStory(
            @ModelAttribute StoryRequest storyRequest, 
            HttpServletRequest request) {
        try {
            Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
            StoryDTO storyDTO = new StoryDTO();
            storyDTO.setMemberId(memberId);
            storyDTO.setContent(storyRequest.getContent());

            // 미디어 파일이 있는 경우 S3에 업로드
            if (storyRequest.getMediaFile() != null && !storyRequest.getMediaFile().isEmpty()) {
                try {
                    String mediaUrl = s3Service.uploadFile(storyRequest.getMediaFile(), "stories");
                    String mediaType = s3Service.getMediaType(storyRequest.getMediaFile().getContentType());
                    
                    storyDTO.setMediaUrl(mediaUrl);
                    storyDTO.setMediaType(mediaType);
                    
                    log.info("스토리 미디어 업로드 성공 - URL: {}", mediaUrl);
                } catch (IllegalArgumentException e) {
                    log.error("스토리 미디어 업로드 실패 - 잘못된 요청: {}", e.getMessage());
                    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
                }
            }
            
            storyService.createStory(storyDTO);
            log.info("스토리 작성 성공 - 회원 ID: {}", memberId);
            return ResponseEntity.ok().body("스토리가 성공적으로 작성되었습니다.");
            
        } catch (Exception e) {
            log.error("스토리 작성 실패: ", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "스토리 작성에 실패했습니다: " + e.getMessage()));
        }
    }

    // 활성화된 스토리 조회
    @GetMapping
    public ResponseEntity<?> getAllStories(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            // 토큰 유효성 검증
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            List<StoryDTO> stories = storyService.getAllActiveStories();
            return ResponseEntity.ok(stories);
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("스토리 목록을 가져오는데 실패했습니다.");
        }
    }

    // 사용자 24시간 내 스토리 조회
    @GetMapping("/my")
    public ResponseEntity<?> getMyStories(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long memberId = jwtTokenProvider.getMemberIdFromToken(token);
            
            List<StoryDTO> stories = storyService.getRecentMemberStories(memberId);
            return ResponseEntity.ok(stories);
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body("내 스토리를 조회할 권한이 없습니다.");
        }
    }

    // 특정 사용자 스토리 조회
    @GetMapping("/user/{memberId}")
    public ResponseEntity<?> getMemberStories(
            @PathVariable Long memberId,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            // 토큰 유효성 검증
            if (!jwtTokenProvider.validateToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            List<StoryDTO> stories = storyService.getMemberStories(memberId);
            return ResponseEntity.ok(stories);
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("사용자의 스토리 목록을 가져오는데 실패했습니다.");
        }
    }

    // 팔로우 사용자 스토리 조회
    @GetMapping("/followed")
    public ResponseEntity<?> getFollowedStories(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            Long memberId = jwtTokenProvider.getMemberIdFromToken(token);
            
            List<StoryDTO> stories = storyService.getFollowedMemberStories(memberId);
            return ResponseEntity.ok(stories);
            
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("팔로우한 사용자의 스토리를 가져오는데 실패했습니다.");
        }
    }
}
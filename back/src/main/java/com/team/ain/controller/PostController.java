package com.team.ain.controller;

import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.team.ain.config.jwt.JwtTokenProvider;
import com.team.ain.dto.post.PageResponseDTO;
import com.team.ain.dto.post.Post;
import com.team.ain.dto.post.PostLike;
import com.team.ain.service.PostService;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {
    private final PostService postService;
    private final JwtTokenProvider jwtTokenProvider;

    // 게시물 생성
    @PostMapping
    public ResponseEntity<String> createPost(@RequestBody Post post, HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        post.setMemberId(memberId);
        postService.createPost(post);
        System.out.println("!! post : "+post);
        return ResponseEntity.ok("게시물이 성공적으로 생성되었습니다.");
    }

    // 게시물 단일 조회
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable("id") Long id, HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        Post post = postService.getPostById(id, memberId);
        return ResponseEntity.ok(post);
    }

    // 페이징된 게시물 조회
    @GetMapping("/page")
    public ResponseEntity<PageResponseDTO<Post>> getPostsByPage(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        Page<Post> postPage = postService.getPostsByPage(page, size, memberId);
        return ResponseEntity.ok(PageResponseDTO.of(postPage));
    }

    // 게시물 수정
    @PutMapping("/{id}")
    public ResponseEntity<String> updatePost(@PathVariable("id") Long id, @RequestBody Post post) {
        post.setId(id);
        postService.updatePost(post);
        return ResponseEntity.ok("게시물이 성공적으로 수정되었습니다.");
    }

    // 게시물 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePost(@PathVariable("id") Long id) {
        postService.deletePostById(id);
        return ResponseEntity.ok("게시물이 성공적으로 삭제되었습니다.");
    }

    // 게시물 좋아요
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likePost(@PathVariable("id") Long id, HttpServletRequest request) {
        try {
            Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
            
            // 이미 좋아요가 있는지 확인
            if (postService.hasLike(id, memberId)) {
                return ResponseEntity
                    .status(HttpStatus.CONFLICT)
                    .body("이미 좋아요가 존재합니다.");
            }
            
            postService.likePost(id, memberId);
            System.out.println("게시글 좋아요 추가");
            return ResponseEntity.ok("게시물 좋아요가 성공적으로 반영되었습니다.");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("좋아요 처리 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikePost(@PathVariable("id") Long id, HttpServletRequest request) {
        try {
            Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
            
            // 좋아요가 있는지 확인
            if (!postService.hasLike(id, memberId)) {
                return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("취소할 좋아요가 존재하지 않습니다.");
            }
            
            postService.unlikePost(id, memberId);
            System.out.println("게시글 좋아요 취소");
            return ResponseEntity.ok("게시물 좋아요가 성공적으로 취소되었습니다.");
        } catch (Exception e) {
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("좋아요 취소 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    // 게시물 좋아요 수
    @GetMapping("/{id}/like")
    public ResponseEntity<PostLike> likeCount(@PathVariable("id") Long id, HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        PostLike likes = postService.getPostLike(id, memberId);
        System.out.println("!! likes : "+likes.isLiked());
        return ResponseEntity.ok(likes);
    }

    // 게시물 좋아요 체크
    @GetMapping("/{id}/like/check")
    public ResponseEntity<Boolean> isLiked(@PathVariable("id") Long id, HttpServletRequest request) {
        Long memberId = jwtTokenProvider.getMemberIdFromRequest(request);
        PostLike likes = postService.getPostLike(id, memberId);
        return ResponseEntity.ok(likes.isLiked());
    }

}
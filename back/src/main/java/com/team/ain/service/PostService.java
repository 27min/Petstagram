package com.team.ain.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.team.ain.dto.post.Post;
import com.team.ain.dto.post.PostLike;
import com.team.ain.dto.post.PostMedia;
import com.team.ain.mapper.PostMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PostService {
    
    private final PostMapper postMapper;

    // 게시물 생성 (미디어 포함)
    public void createPost(Post post) {
        // 게시물 기본 정보 저장
        postMapper.insertPost(post);
        
        // 미디어가 있다면 저장
        if (post.getMediaList() != null && !post.getMediaList().isEmpty()) {
            for (PostMedia media : post.getMediaList()) {
                media.setPostId(post.getId());  // 생성된 게시물 ID 설정
            }
            postMapper.insertPostMedia(post.getMediaList());
        }
    }

    // 게시물 수정 (미디어 포함)
    public void updatePost(Post post) {
        // 게시물 기본 정보 수정
        postMapper.updatePost(post);
        
        // 기존 미디어 삭제
        postMapper.deletePostMedia(post.getId());
        
        // 새로운 미디어가 있다면 추가
        if (post.getMediaList() != null && !post.getMediaList().isEmpty()) {
            for (PostMedia media : post.getMediaList()) {
                media.setPostId(post.getId());
            }
            postMapper.insertPostMedia(post.getMediaList());
        }
    }

    // 게시물 단일 조회 (미디어 포함)
    public Post getPostById(Long id, Long currentMemberId) {
        return postMapper.getPostById(id, currentMemberId);
    }

    // 게시물 전체 조회
    public List<Post> getAllPosts() {
        return postMapper.getAllPosts();
    }

    // 게시물 삭제 (미디어도 함께 삭제)
    public void deletePostById(Long id) {
        // post_media 테이블의 데이터는 CASCADE 설정으로 자동 삭제
        postMapper.deletePostById(id);
    }

    // 페이지 계산 (미디어 포함)
    public Page<Post> getPostsByPage(int page, int size, Long currentMemberId) {
        if (page < 0) page = 0;
        if (size < 1) size = 10;

        int totalPosts = postMapper.getTotalPostCount();
        List<Post> posts = postMapper.getPostsByPage(page, size, currentMemberId);
        
        return new PageImpl<>(posts, PageRequest.of(page, size), totalPosts);
    }

    // 특정 미디어만 삭제
    public void deletePostMedia(Long mediaId) {
        postMapper.deletePostMediaById(mediaId);
    }

    // 게시물 좋아요
    public void likePost(Long postId, Long memberId) {
        postMapper.insertPostLike(postId, memberId);
    }
    // 게시물 좋아요 취소
    public void unlikePost(Long postId, Long memberId) {
        postMapper.deletePostLike(postId, memberId);
    }
    // 좋아요 수
    public PostLike getPostLike(Long postId, Long memberId) {
        return postMapper.getPostLikes(postId, memberId);
    }

    public boolean hasLike(Long postId, Long memberId) {
        // 좋아요 존재 여부 확인 쿼리
        return postMapper.hasLike(postId, memberId);
    }
}
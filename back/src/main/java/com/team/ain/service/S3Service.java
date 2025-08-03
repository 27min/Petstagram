package com.team.ain.service;

import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.model.ObjectMetadata;
import com.amazonaws.services.s3.model.PutObjectRequest;

import io.github.cdimascio.dotenv.Dotenv;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class S3Service {
    private final AmazonS3 amazonS3;
    private final String bucketName;
    
    // 스토리 허용 파일 형식 정의
    private static final Set<String> ALLOWED_STORY_TYPES = new HashSet<>(Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif",
        "video/mp4", "video/quicktime"  // MOV는 video/quicktime
    ));

    // 프로필 허용 파일 형식 정의
    private static final Set<String> ALLOWED_PROFILE_TYPES = new HashSet<>(Arrays.asList(
        "image/jpeg", "image/jpg", "image/png"
    ));

    public S3Service(AmazonS3 amazonS3) {
        Dotenv dotenv = Dotenv.configure().load();
        this.amazonS3 = amazonS3;
        this.bucketName = dotenv.get("AWS_BUCKET_NAME");

        if (this.bucketName == null) {
            throw new IllegalArgumentException("AWS_BUCKET_NAME cannot be null.");
        }
    }

    public String uploadFile(MultipartFile file, String directory) {
        // 파일 검증
        validateFile(file, directory);

        // 파일명 생성 (디렉토리 포함)
        String fileName = createFileName(file.getOriginalFilename(), directory);

        try (InputStream inputStream = file.getInputStream()) {
            // 메타데이터 설정
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());
            
            // S3에 업로드
            amazonS3.putObject(new PutObjectRequest(
                bucketName, 
                fileName, 
                inputStream, 
                metadata
            ));

            log.info("파일 업로드 성공 - 디렉토리: {}, 파일명: {}", directory, fileName);
            
            // 파일 URL 반환
            return amazonS3.getUrl(bucketName, fileName).toString();
        } catch (IOException e) {
            log.error("파일 업로드 실패: ", e);
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    private void validateFile(MultipartFile file, String directory) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("빈 파일입니다.");
        }

        String contentType = file.getContentType();
        if (contentType == null) {
            throw new IllegalArgumentException("파일 형식을 확인할 수 없습니다.");
        }

        // 디렉토리별 검증
        switch (directory) {
            case "stories":
                validateStoryFile(file, contentType);
                break;
            case "profiles":
                validateProfileFile(file, contentType);
                break;
            default:
                // 기본 검증
                if (file.getSize() > 10 * 1024 * 1024) {
                    throw new IllegalArgumentException("파일 크기는 10MB를 초과할 수 없습니다.");
                }
        }
    }

    private void validateStoryFile(MultipartFile file, String contentType) {
        if (!ALLOWED_STORY_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "지원하지 않는 파일 형식입니다. 지원되는 형식: JPG, PNG, MP4, MOV, GIF"
            );
        }
        
        if (file.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("스토리 파일 크기는 10MB를 초과할 수 없습니다.");
        }
    }

    private void validateProfileFile(MultipartFile file, String contentType) {
        if (!ALLOWED_PROFILE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "프로필 사진은 JPG, PNG 형식만 지원됩니다."
            );
        }
        
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("프로필 사진 크기는 5MB를 초과할 수 없습니다.");
        }
    }

    // 파일 종류 확인 (스토리용)
    public String getMediaType(String contentType) {
        if (contentType.startsWith("image/")) {
            return contentType.equals("image/gif") ? "GIF" : "IMAGE";
        } else if (contentType.startsWith("video/")) {
            return "VIDEO";
        }
        return null;
    }

    public void deleteFile(String fileUrl) {
        String fileName = extractFileKeyFromUrl(fileUrl);
        try {
            amazonS3.deleteObject(bucketName, fileName);
            log.info("파일 삭제 성공: {}", fileName);
        } catch (Exception e) {
            log.error("파일 삭제 실패: ", e);
            throw new RuntimeException("파일 삭제 실패", e);
        }
    }

    private String createFileName(String originalFileName, String directory) {
        return directory + "/" + UUID.randomUUID().toString() + "_" + originalFileName;
    }

    private String extractFileKeyFromUrl(String fileUrl) {
        try {
            URL url = new URL(fileUrl);
            String path = url.getPath();
            return path.substring(path.indexOf('/', 1) + 1);
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("잘못된 파일 URL입니다.", e);
        }
    }
}
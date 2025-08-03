package com.team.ain.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.team.ain.service.S3Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {
    private final S3Service s3Service;

    @PostMapping("/upload")
    public ResponseEntity<?> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("directory") String directory) {
        try {

            String fileUrl = s3Service.uploadFile(file, directory);
            log.info("파일 업로드 성공 - URL: {}", fileUrl);

            return ResponseEntity.ok(Map.of("url", fileUrl));
        } catch (IllegalArgumentException e) {
            log.error("파일 업로드 실패 - 잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("파일 업로드 실패 - 서버 오류: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "파일 업로드 중 오류가 발생했습니다."));
        }
    }

    @DeleteMapping
    public ResponseEntity<?> deleteFile(@RequestParam String fileUrl) {
        try {
            log.info("파일 삭제 요청 - URL: {}", fileUrl);
            s3Service.deleteFile(fileUrl);
            log.info("파일 삭제 성공");
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("파일 삭제 실패: ", e);
            return ResponseEntity.internalServerError()
                .body(Map.of("error", "파일 삭제 중 오류가 발생했습니다."));
        }
    }
}
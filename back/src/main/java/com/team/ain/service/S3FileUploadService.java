// package com.team.ain.service;

// import lombok.RequiredArgsConstructor;
// import org.springframework.beans.factory.annotation.Value;
// import org.springframework.stereotype.Service;
// import org.springframework.web.multipart.MultipartFile;
// import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
// import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
// import software.amazon.awssdk.regions.Region;
// import software.amazon.awssdk.services.s3.S3Client;
// import software.amazon.awssdk.services.s3.model.PutObjectRequest;

// import java.nio.file.Paths;
// import java.util.UUID;

// @Service
// @RequiredArgsConstructor
// public class S3FileUploadService {

//     @Value("${AWS_S3_BUCKET}")
//     private String bucketName;

//     @Value("${AWS_REGION}")
//     private String region;

//     @Value("${AWS_ACCESS_KEY}")
//     private String accessKey;

//     @Value("${AWS_SECRET_KEY}")
//     private String secretKey;

//     // S3 파일 업로드
//     public String uploadFile(MultipartFile file, String fileName) {
//         S3Client s3Client = S3Client.builder()
//                 .region(Region.of(region))
//                 .credentialsProvider(StaticCredentialsProvider.create(
//                         AwsBasicCredentials.create(accessKey, secretKey)))
//                 .build();

//         try {
//             // S3 업로드 요청 생성
//             PutObjectRequest putObjectRequest = PutObjectRequest.builder()
//                     .bucket(bucketName)
//                     .key(fileName)
//                     .build();

//             // 파일 업로드
//             s3Client.putObject(putObjectRequest, Paths.get(file.getOriginalFilename()));

//             // 업로드된 파일의 URL 반환
//             return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);

//         } catch (Exception e) {
//             throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
//         } finally {
//             s3Client.close();
//         }
//     }
// }

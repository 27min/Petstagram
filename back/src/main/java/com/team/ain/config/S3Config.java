package com.team.ain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.amazonaws.auth.AWSStaticCredentialsProvider;
import com.amazonaws.auth.BasicAWSCredentials;
import com.amazonaws.client.builder.AwsClientBuilder;
import com.amazonaws.regions.Regions;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;

import io.github.cdimascio.dotenv.Dotenv;

@Configuration
public class S3Config {

    @Bean
    public AmazonS3 amazonS3() {
        try {
            Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // .env 파일이 없어도 에러가 나지 않도록
                .load();

            String provider = dotenv.get("S3_PROVIDER");
            provider = (provider != null) ? provider : "AWS";

            if ("NAVER".equalsIgnoreCase(provider)) {
                String accessKey = dotenv.get("NAVER_ACCESS_KEY");
                String secretKey = dotenv.get("NAVER_SECRET_KEY");
                String region = dotenv.get("NAVER_REGION");
                String endPoint = dotenv.get("NAVER_END_POINT");

                if (accessKey == null || secretKey == null || region == null || endPoint == null) {
                    throw new IllegalArgumentException("Naver Cloud credentials not found in .env file");
                }

                BasicAWSCredentials credentials = new BasicAWSCredentials(accessKey, secretKey);
                return AmazonS3ClientBuilder.standard()
                        .withEndpointConfiguration(new AwsClientBuilder.EndpointConfiguration(endPoint, region))
                        .withCredentials(new AWSStaticCredentialsProvider(credentials))
                        .withPathStyleAccessEnabled(true)
                        .build();
            } else {
                String accessKeyId = dotenv.get("AWS_ACCESS_KEY_ID");
                String secretKey = dotenv.get("AWS_SECRET_ACCESS_KEY");
                String region = dotenv.get("AWS_REGION");

                if (accessKeyId == null || secretKey == null || region == null) {
                    throw new IllegalArgumentException("AWS credentials not found in .env file");
                }

                BasicAWSCredentials awsCredentials = new BasicAWSCredentials(accessKeyId, secretKey);

                return AmazonS3ClientBuilder.standard()
                        .withRegion(Regions.fromName(region))
                        .withCredentials(new AWSStaticCredentialsProvider(awsCredentials))
                        .build();
            }
        } catch (Exception e) {
            // 구체적인 에러 로깅
            System.out.println("Error loading S3 configuration: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
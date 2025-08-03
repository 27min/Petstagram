package com.team.ain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        config.setAllowCredentials(true);
        config.addAllowedOrigin("http://localhost:3000");
        config.addAllowedOrigin("http://127.0.0.1:3000");
        config.addAllowedOrigin("http://172.30.1.55:3000");  // 추가
        config.addAllowedOrigin("http://192.168.44.212:3000");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        
        // 인증 관련 헤더 명시적 허용
        // config.addExposedHeader("Authorization");
        // config.addExposedHeader("X-Naver-Client-Id");
        // config.addExposedHeader("X-Naver-Client-Secret");
        
        // preflight 요청 캐시 시간 설정 (3600초 = 1시간)
        // config.setMaxAge(3600L);
        
        source.registerCorsConfiguration("/**", config);

        return new CorsFilter(source);
    }
}

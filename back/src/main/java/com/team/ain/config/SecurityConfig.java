package com.team.ain.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.CorsFilter;

import com.team.ain.config.jwt.JwtAccessDeniedHandler;
import com.team.ain.config.jwt.JwtAuthenticationEntryPoint;
import com.team.ain.config.jwt.JwtAuthenticationFilter;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsFilter corsFilter;
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CORS 필터 추가
            .addFilterBefore(corsFilter, UsernamePasswordAuthenticationFilter.class)
            
            // CSRF 비활성화
            .csrf(csrf -> csrf.disable())
            
            // JWT 필터 추가
            .addFilterBefore(jwtAuthenticationFilter, 
                            UsernamePasswordAuthenticationFilter.class)
            
            // CORS 활성화
            .cors(cors -> cors.configure(http))
            
            // 세션 관리 설정
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            
            // 요청 권한 설정
            .authorizeHttpRequests(auth -> auth
                // Swagger UI 접근 허용
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                // 로그인, 회원가입, 게시글 불러오기 엔드포인트 허용
                .requestMatchers("/api/auth/**", "/api/member/signup", "/api/posts/page/**", "/api/member/{memberId}").permitAll()
                // 게시글 작성, 수정, 삭제는 로그인상태만 가능
                .requestMatchers(HttpMethod.POST, "/api/post/**").authenticated()
                .requestMatchers(HttpMethod.PUT, "/api/post/**").authenticated()
                .requestMatchers(HttpMethod.DELETE, "/api/post/**").authenticated()
                // WebSocket 엔드포인트 허용
                .requestMatchers("/ws/**").permitAll()
                // 나머지 API는 인증 필요
                .anyRequest().authenticated()
            )
            
            // 예외 처리
            .exceptionHandling(exception -> 
                exception
                    .authenticationEntryPoint(new JwtAuthenticationEntryPoint())
                    .accessDeniedHandler(new JwtAccessDeniedHandler())
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authenticationConfiguration) throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }
}

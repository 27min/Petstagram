package com.team.ain.scheduler;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class StoryScheduler {
    
    private final JdbcTemplate jdbcTemplate;
    private static final Logger logger = LoggerFactory.getLogger(StoryScheduler.class);
    
    @Scheduled(fixedRate = 60000) // 1분마다 실행
    public void updateExpiredStories() {
        try {
            String sql = """
                UPDATE story 
                SET status = 'PRIVATE'
                WHERE expires_at <= CURRENT_TIMESTAMP 
                AND status = 'ACTIVE'
            """;
            
            int updatedCount = jdbcTemplate.update(sql);
            logger.info("스토리 만료 처리 완료. 업데이트된 스토리 수: {}", updatedCount);
            
        } catch (Exception e) {
            logger.error("스토리 만료 처리 중 오류 발생: ", e);
        }
    }
}
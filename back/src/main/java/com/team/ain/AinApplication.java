package com.team.ain;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@SpringBootApplication
public class AinApplication {

	public static void main(String[] args) {
		SpringApplication.run(AinApplication.class, args);
	}

}

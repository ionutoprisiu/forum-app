package com.example.ForumAppBackend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories
public class ForumAppBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(ForumAppBackendApplication.class, args);
	}
}

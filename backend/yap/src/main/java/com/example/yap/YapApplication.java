package com.example.yap;

import com.example.yap.config.EnvLoader;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class YapApplication {

	public static void main(String[] args) {
		// Load environment variables from the .env file
		EnvLoader.loadEnvFile("src/main/resources/.env");

		// Optionally print variables for debugging
		System.out.println("App Name: " + System.getProperty("APP_NAME"));

		SpringApplication.run(YapApplication.class, args);
	}
}

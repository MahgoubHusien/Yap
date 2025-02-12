package com.example.yap.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())  // Updated syntax for disabling CSRF
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/", "/api/**").permitAll()  // Allow root and API endpoints
                        .anyRequest().authenticated()
                )
                .httpBasic(Customizer.withDefaults());  // Enable basic authentication (if needed)

        return http.build();
    }
}

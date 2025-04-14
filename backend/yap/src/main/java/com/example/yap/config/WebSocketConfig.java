package com.example.yap.config;

import com.example.yap.handlers.CustomWebSocketHandler;
import com.example.yap.handlers.WebRTCSignalingHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        // General WebSocket handler
        registry.addHandler(new CustomWebSocketHandler(), "/ws")
                .setAllowedOrigins("http://localhost:3000");  // Allow the frontend to connect
        
        // WebRTC signaling handler
        registry.addHandler(new WebRTCSignalingHandler(), "/rtc")
                .setAllowedOrigins("http://localhost:3000");  // Allow the frontend to connect
    }
}

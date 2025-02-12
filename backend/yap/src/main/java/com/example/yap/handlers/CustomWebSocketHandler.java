package com.example.yap.handlers;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;

public class CustomWebSocketHandler extends TextWebSocketHandler {

    // Keep track of active sessions
    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("New WebSocket connection established: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        System.out.println("Received message: " + message.getPayload());

        // Broadcast the message to all active sessions
        for (WebSocketSession activeSession : sessions) {
            if (activeSession.isOpen()) {
                activeSession.sendMessage(new TextMessage("Echo: " + message.getPayload()));
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        sessions.remove(session);
        System.out.println("WebSocket connection closed: " + session.getId());
    }
}

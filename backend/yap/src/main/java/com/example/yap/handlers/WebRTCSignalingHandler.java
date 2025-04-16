package com.example.yap.handlers;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * WebRTC Signaling Handler
 * Manages WebRTC signaling messages between peers for video chat functionality
 */
public class WebRTCSignalingHandler extends TextWebSocketHandler {

    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // Keep track of active sessions
    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();
    
    // Map of roomId to list of sessions in that room
    private static final Map<String, CopyOnWriteArrayList<WebSocketSession>> rooms = new ConcurrentHashMap<>();
    
    // Map of sessionId to userId
    private static final Map<String, String> sessionToUser = new ConcurrentHashMap<>();
    
    // Map of sessionId to roomId
    private static final Map<String, String> sessionToRoom = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        System.out.println("New WebRTC signaling connection established: " + session.getId());
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            // Parse the message
            Map<String, Object> payload = objectMapper.readValue(message.getPayload(), Map.class);
            String type = (String) payload.get("type");
            String userId = (String) payload.get("userId");
            String roomId = (String) payload.get("roomId");
            
            // Store the userId for this session
            if (userId != null) {
                sessionToUser.put(session.getId(), userId);
            }
            
            System.out.println("Received WebRTC signaling message: " + type + " from user: " + userId);
            
            // Handle different message types
            switch (type) {
                case "join":
                    handleJoinRoom(session, roomId, userId);
                    break;
                    
                case "leave":
                    handleLeaveRoom(session, roomId);
                    break;
                    
                case "offer":
                case "answer":
                case "candidate":
                    // Forward the message to other peers in the room
                    forwardMessageToRoom(roomId, message, session);
                    break;
                    
                default:
                    System.out.println("Unknown message type: " + type);
            }
            
        } catch (Exception e) {
            System.err.println("Error handling WebRTC signaling message: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Handle a user joining a room
     */
    private void handleJoinRoom(WebSocketSession session, String roomId, String userId) throws IOException {
        if (roomId == null) return;
        
        // Add session to the room
        rooms.computeIfAbsent(roomId, k -> new CopyOnWriteArrayList<>()).add(session);
        sessionToRoom.put(session.getId(), roomId);
        
        System.out.println("User " + userId + " joined room " + roomId);
        
        // Notify other users in the room that a new user has joined
        Map<String, Object> joinMessage = Map.of(
            "type", "join",
            "roomId", roomId,
            "userId", userId
        );
        
        String joinMessageStr = objectMapper.writeValueAsString(joinMessage);
        TextMessage textMessage = new TextMessage(joinMessageStr);
        
        // Send to all other sessions in the room
        CopyOnWriteArrayList<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null) {
            for (WebSocketSession peer : roomSessions) {
                if (!peer.getId().equals(session.getId()) && peer.isOpen()) {
                    peer.sendMessage(textMessage);
                }
            }
        }
    }

    /**
     * Handle a user leaving a room
     */
    private void handleLeaveRoom(WebSocketSession session, String roomId) throws IOException {
        if (roomId == null) return;
        
        // Remove session from the room
        CopyOnWriteArrayList<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null) {
            roomSessions.remove(session);
            
            // If room is empty, remove it
            if (roomSessions.isEmpty()) {
                rooms.remove(roomId);
            }
        }
        
        // Remove from session to room mapping
        sessionToRoom.remove(session.getId());
        
        String userId = sessionToUser.get(session.getId());
        System.out.println("User " + userId + " left room " + roomId);
        
        // Notify other users in the room that a user has left
        if (userId != null) {
            Map<String, Object> leaveMessage = Map.of(
                "type", "leave",
                "roomId", roomId,
                "userId", userId
            );
            
            String leaveMessageStr = objectMapper.writeValueAsString(leaveMessage);
            TextMessage textMessage = new TextMessage(leaveMessageStr);
            
            // Send to all other sessions in the room
            if (roomSessions != null) {
                for (WebSocketSession peer : roomSessions) {
                    if (peer.isOpen()) {
                        peer.sendMessage(textMessage);
                    }
                }
            }
        }
    }

    /**
     * Forward a message to all other peers in a room
     */
    private void forwardMessageToRoom(String roomId, TextMessage message, WebSocketSession sender) throws IOException {
        if (roomId == null) return;
        
        CopyOnWriteArrayList<WebSocketSession> roomSessions = rooms.get(roomId);
        if (roomSessions != null) {
            for (WebSocketSession peer : roomSessions) {
                if (!peer.getId().equals(sender.getId()) && peer.isOpen()) {
                    peer.sendMessage(message);
                }
            }
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, org.springframework.web.socket.CloseStatus status) {
        // Get the room this session was in
        String roomId = sessionToRoom.get(session.getId());
        if (roomId != null) {
            try {
                handleLeaveRoom(session, roomId);
            } catch (IOException e) {
                System.err.println("Error handling connection close: " + e.getMessage());
            }
        }
        
        // Remove from all collections
        sessions.remove(session);
        sessionToUser.remove(session.getId());
        sessionToRoom.remove(session.getId());
        
        System.out.println("WebRTC signaling connection closed: " + session.getId());
    }
}
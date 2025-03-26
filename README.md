# Yap

**Version 1.0**  
**Semester:** Spring-2025
**Author(s):** Abdulahi Mohamed, Mahgoub Husien, Nathan Abraham, Olufewa Alonge, Zain Ghosheh

## 🚀 Overview

**Yap** is a web application for spontaneous, real-time conversations. Users can join "Free Talk" video sessions or participate in trending topic-based discussions. Yap also supports basic user profiles, messaging, a friends list, and a history of recent chats.

Inspired by the lean design of apps like **Monkey**, Yap aims to create meaningful connections with minimal friction.

---

## 🔧 Features

### ✅ Core Functionality
- **Free Talk Video Chats** (2–8 users)
- **Topic-Based Rooms** for daily discussions
- **Real-Time Messaging** with chat history
- **Friends List** and online status
- **User Profiles** with display picture and status
- **Recent Live Chats** for easy reconnection

---

## 🛠️ Tech Stack

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript, Socket.IO
- **Database:** PostgreSQL (via Prisma ORM)
- **Real-Time Communication:** WebRTC with TURN/STUN
- **Authentication:** JWT, OAuth (planned)

---

## 🧠 Architecture

```plaintext
+-----------------------+        +-------------------------+
|     User Devices      |        |       Web Browser       |
|  (Desktop/Mobile)     |<-----> |    Next.js Frontend     |
+-----------------------+        +-------------------------+
         |                                 |
         | WebSockets / REST APIs          | HTTP/HTTPS, WebSockets
         v                                 v
+----------------------------------------------------------+
|                 Node.js / Express Backend                |
|  - REST API Endpoints                                    |
|  - Socket.IO Real-Time Communication                     |
|  - JWT Authentication                                    |
+----------------------------------------------------------+
         |
         | Database Queries / Media Setup
         v
+--------------------------+       +-------------------------+
|    PostgreSQL Database   |       | TURN/STUN Servers       |
+--------------------------+       +-------------------------+



```

## 🔐 Security Highlights

- JWT-based authentication with secure storage
- HTTPS & encrypted WebSockets
- Input validation to prevent XSS/injection
- Rate limiting and activity monitoring

---

## 🧪 Testing & CI/CD

- **Unit Testing:** Jest + React Testing Library
- **E2E Testing:** Cypress
- **CI/CD:** GitHub Actions (build, test, deploy)
- **Logging & Monitoring:** Sentry, LogRocket, CloudWatch


# Secure Testing Guide for Yap Video Chat

## Overview

This guide explains how to test the Yap video chat application securely using HTTPS with self-signed certificates. This approach resolves security warnings that browsers display when using WebRTC over insecure connections.

## Setting Up Secure Development Environment

### 1. Generate Self-Signed Certificates

Run the following command from the `frontend` directory to generate self-signed certificates:

```bash
npm run generate-cert
```

This will create a `certs` directory containing your certificates.

### 2. Start the Development Server with HTTPS

```bash
npm run dev:secure
```

The server will now be accessible at: https://localhost:3000 or https://your-ip-address:3000

### 3. Handling Browser Security Warnings

Since you're using self-signed certificates, your browser will show a security warning when you first access the site. Here's how to proceed:

#### Chrome
1. Click anywhere on the page and type "thisisunsafe" (without quotes)
2. The browser will bypass the warning and load the page

#### Firefox
1. Click "Advanced"
2. Click "Accept the Risk and Continue"

#### Safari
1. Click "Show Details"
2. Click "visit this website"
3. Enter your computer password when prompted

## For Participants

1. Share the secure HTTPS link with participants
2. They will need to follow the same steps to bypass the browser security warning
3. Once they've accepted the certificate, they can join your video call room

## Troubleshooting

- If you see WebRTC connection errors, ensure all participants are using HTTPS
- Make sure your firewall allows connections on the development port (default: 3000)
- If the backend server is running separately, it should also use HTTPS for secure WebSocket connections
- Some networks may block WebRTC connections; try using a different network if issues persist

## Why This Works

WebRTC requires secure contexts (HTTPS) for many of its features to work properly in modern browsers. By using self-signed certificates for local development, you're creating a secure context that allows WebRTC to function correctly without security warnings.
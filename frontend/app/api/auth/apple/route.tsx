// app/api/auth/apple/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST() {
  try {
    // Apple OAuth configuration
    const clientId = process.env.APPLE_CLIENT_ID;
    const redirectUri = process.env.APPLE_REDIRECT_URI;
    
    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { message: 'OAuth configuration missing' },
        { status: 500 }
      );
    }

    // Generate a random state parameter for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Generate a nonce for additional security
    const nonce = crypto.randomBytes(16).toString('hex');
    
    // Store state and nonce securely (this is simplified)
    // In a real app, you would store these in a secure session

    // Build the authorization URL
    const scope = 'name email';
    const authUrl = `https://appleid.apple.com/auth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code id_token&scope=${encodeURIComponent(scope)}&response_mode=form_post&state=${state}&nonce=${nonce}`;

    return NextResponse.json({ authUrl }, { status: 200 });
    
  } catch (error) {
    console.error('Apple OAuth error:', error);
    return NextResponse.json(
      { message: 'Failed to initialize Apple login' },
      { status: 500 }
    );
  }
}
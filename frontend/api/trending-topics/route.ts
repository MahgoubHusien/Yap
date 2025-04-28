// File: app/api/trending-topics/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetch data from your Python service
    const response = await fetch("http://localhost:5001/trends");
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch trending topics" },
      { status: 500 }
    );
  }
}
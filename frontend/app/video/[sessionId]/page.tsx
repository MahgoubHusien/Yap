// app/video/[sessionId]/page.tsx
import React from 'react'
import VideoCall from '@/components/VideoCall'

interface VideoPageProps {
  params: { sessionId: string }
}

 export default async function VideoPage({ params }: VideoPageProps) {
    const { sessionId } = params

  return (
    // VideoCall must be a client component that takes sessionId
    <VideoCall sessionId={sessionId} />
  )
}

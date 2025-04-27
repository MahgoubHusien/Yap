// app/topics/[topicId]/page.tsx
import VideoCall from '@/components/VideoCall'
import { topics } from '@/lib/topics'
import { notFound } from 'next/navigation'

interface CallPageProps {
  params: { topicId: string }
}

export default function CallPage({ params }: CallPageProps) {
  const idx = parseInt(params.topicId, 10)
  if (isNaN(idx) || idx < 0 || idx >= topics.length) {
    notFound()
  }
  const topic = topics[idx]

  return <VideoCall topicName={topic.title} />
}

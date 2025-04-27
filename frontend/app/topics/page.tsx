// app/topics/page.tsx
import Link from 'next/link'
import { topics } from '../../lib/topics'

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white py-10 px-6">
      <h1 className="text-4xl font-bold text-center mb-8">🔥 Trending Debate Topics</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {topics.map((topic, index) => (
          <Link
            key={index}
            href={`/topics/${index}`}
            className="block p-6 border border-gray-300 dark:border-gray-700 rounded-lg shadow-md bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">{topic.category}</h3>
            <p className="text-md mt-2">{topic.title}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}

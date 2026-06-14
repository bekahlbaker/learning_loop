import Image from 'next/image'
import type { LessonContent } from '@/app/types/curriculum'

export interface LessonContentBlockProps {
  content: LessonContent
  loading?: boolean
}

export default function LessonContentBlock({ content, loading }: LessonContentBlockProps) {
  if (loading) {
    return <div className="h-24 rounded-xl bg-gray-100 animate-pulse" />
  }

  if (!content) {
    return null
  }

  if (content.type === 'text') {
    return <p className="text-sm text-gray-700 leading-relaxed">{content.body}</p>
  }

  if (content.type === 'image') {
    return (
      <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
        <Image
          src={content.imageUrl}
          alt={content.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 512px"
        />
      </div>
    )
  }

  return null
}

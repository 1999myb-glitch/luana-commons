'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ShareToFeed({
  meetingId,
  meetingTitle,
  decisions,
  pdcaNext,
}: {
  meetingId: string
  meetingTitle: string
  decisions: string
  pdcaNext: string
}) {
  const [posting, setPosting] = useState<'learning' | 'project' | null>(null)
  const [done, setDone] = useState(false)

  function buildBody() {
    const parts: string[] = []
    if (decisions) parts.push(`📌 決定事項\n${decisions}`)
    if (pdcaNext) parts.push(`🔜 次回やること\n${pdcaNext}`)
    if (parts.length === 0) parts.push(`「${meetingTitle}」の振り返りです。`)
    parts.push(`（会議「${meetingTitle}」より）`)
    return parts.join('\n\n')
  }

  async function handleShare(category: 'learning' | 'project') {
    setPosting(category)
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    let authorName = 'ゲスト'
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single()
      authorName = profile?.display_name || 'ゲスト'
    }

    await supabase.from('posts').insert({
      title: meetingTitle,
      body: buildBody(),
      category,
      author_name: authorName,
      image_urls: [],
      likes_count: 0,
      meeting_id: meetingId,
      user_id: user?.id,
    })

    setPosting(null)
    setDone(true)
  }

  return (
    <div>
      <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">🔗 振り返りを共有</p>
      {done ? (
        <div className="bg-white border border-[#F0F0F0] rounded-xl p-5 text-center">
          <p className="text-sm font-bold text-[#1A1A1A] mb-2">投稿しました</p>
          <Link href="/" className="text-xs text-[#E15252] font-bold">ホームで確認する →</Link>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => handleShare('learning')}
            disabled={posting !== null}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#F0F0F0] text-sm font-bold text-[#1A1A1A] disabled:opacity-50"
          >
            {posting === 'learning' ? '投稿中...' : '📖 Learningに投稿'}
          </button>
          <button
            onClick={() => handleShare('project')}
            disabled={posting !== null}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-[#F0F0F0] text-sm font-bold text-[#1A1A1A] disabled:opacity-50"
          >
            {posting === 'project' ? '投稿中...' : '🚀 プロジェクトに投稿'}
          </button>
        </div>
      )}
    </div>
  )
}

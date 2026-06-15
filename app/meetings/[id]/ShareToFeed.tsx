'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface TaskItem {
  title: string
  done?: boolean
  status?: '未着手' | '進行中' | '完了'
}

interface ReportInsight {
  insight: string | null
  improvement: string | null
}

function getStatus(task: TaskItem): '未着手' | '進行中' | '完了' {
  return task.status ?? (task.done ? '完了' : '未着手')
}

export default function ShareToFeed({
  meetingId,
  meetingTitle,
  decisions,
  tasks,
  reports,
  pdcaCheck,
  pdcaAct,
  pdcaNext,
}: {
  meetingId: string
  meetingTitle: string
  decisions: string
  tasks: TaskItem[]
  reports: ReportInsight[]
  pdcaCheck: string
  pdcaAct: string
  pdcaNext: string
}) {
  const [posting, setPosting] = useState<'learning' | 'project' | null>(null)
  const [done, setDone] = useState(false)

  function buildLearningBody() {
    const parts: string[] = []
    if (decisions) parts.push(`📌 決定事項\n${decisions}`)

    const insights = reports.map(r => r.insight).filter((v): v is string => !!v)
    if (insights.length > 0) parts.push(`💡 気づき\n${insights.join('\n')}`)

    const improvements = reports.map(r => r.improvement).filter((v): v is string => !!v)
    if (improvements.length > 0) parts.push(`🔜 次回改善点\n${improvements.join('\n')}`)

    const pdcaLines: string[] = []
    if (pdcaCheck) pdcaLines.push(`Check: ${pdcaCheck}`)
    if (pdcaAct) pdcaLines.push(`Act: ${pdcaAct}`)
    if (pdcaLines.length > 0) parts.push(`🔄 PDCA\n${pdcaLines.join('\n')}`)

    if (parts.length === 0) parts.push(`「${meetingTitle}」の振り返りです。`)
    parts.push(`（会議「${meetingTitle}」より）`)
    return parts.join('\n\n')
  }

  function buildProjectBody() {
    const parts: string[] = []

    const total = tasks.length
    const completed = tasks.filter(t => getStatus(t) === '完了')
    const incomplete = tasks.filter(t => getStatus(t) !== '完了')
    if (total > 0) {
      const percent = Math.round((completed.length / total) * 100)
      parts.push(`📊 進捗状況\n進捗率 ${percent}%（${completed.length} / ${total} 完了）`)
    }
    if (completed.length > 0) parts.push(`✅ 完了タスク\n${completed.map(t => `・${t.title}`).join('\n')}`)
    if (incomplete.length > 0) parts.push(`⏳ 未完了タスク\n${incomplete.map(t => `・${t.title}`).join('\n')}`)
    if (pdcaNext) parts.push(`🔜 次回やること\n${pdcaNext}`)

    if (parts.length === 0) parts.push(`「${meetingTitle}」の進捗報告です。`)
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

    const body = category === 'learning' ? buildLearningBody() : buildProjectBody()

    await supabase.from('posts').insert({
      title: meetingTitle,
      body,
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

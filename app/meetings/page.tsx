import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface TaskItem {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  assignee: string
}

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  done:       { label: '完了', color: '#4FAF7A', bg: '#E8F6EF' },
  processing: { label: '解析中', color: '#C6A23A', bg: '#FBF6E3' },
  error:      { label: 'エラー', color: '#E15252', bg: '#FCEAE3' },
}

export default async function MeetingsList() {
  const supabase = await createClient()
  const { data: meetings } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">☕</Link>
          <h1 className="text-lg font-black text-[#1A1A1A] flex-1">ミーティングログ</h1>
          <Link href="/meetings/new" className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold whitespace-nowrap">
            ＋ 録音する
          </Link>
        </header>

        {(!meetings || meetings.length === 0) ? (
          <div className="bg-white border border-[#F0F0F0] rounded-xl p-8 text-center">
            <p className="text-sm text-[#9B9B9B]">まだミーティングログがありません</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {meetings.map(meeting => {
              const meta = STATUS_META[meeting.status] || STATUS_META.processing
              const tasks = (meeting.tasks as TaskItem[] | null) || []
              return (
                <Link key={meeting.id} href={`/meetings/${meeting.id}`} className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-3 hover:border-[#E15252] transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#1A1A1A] truncate">{meeting.title}</p>
                    <p className="text-xs text-[#9B9B9B]">
                      {new Date(meeting.created_at).toLocaleString('ja-JP')}
                      {meeting.status === 'done' ? ` ・ タスク${tasks.length}件` : ''}
                    </p>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: meta.color, background: meta.bg }}>
                    {meta.label}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

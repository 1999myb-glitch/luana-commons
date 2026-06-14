import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import ShareButton from './ShareButton'
import MeetingEditor from './MeetingEditor'

interface PdcaResult {
  plan: string
  do: string
  check: string
  act: string
}

interface TaskItem {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  assignee: string
}

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: '高', color: '#E15252', bg: '#FCEAE3' },
  medium: { label: '中', color: '#C6A23A', bg: '#FBF6E3' },
  low:    { label: '低', color: '#4FAF7A', bg: '#E8F6EF' },
}

export default async function MeetingDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: meeting } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()

  if (!meeting) notFound()

  const createdAt = new Date(meeting.created_at).toLocaleString('ja-JP')
  const pdca = meeting.pdca as PdcaResult | null
  const tasks = (meeting.tasks as TaskItem[] | null) || []

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/meetings" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">📋</Link>
          <h1 className="text-lg font-black text-[#1A1A1A] flex-1 truncate">{meeting.title}</h1>
        </header>

        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-[#9B9B9B]">{createdAt}</p>
            <div className="flex items-center gap-2">
              <ShareButton />
              <MeetingEditor id={meeting.id} initialTitle={meeting.title} initialMemo={meeting.memo || ''} />
            </div>
          </div>

          {meeting.memo && (
            <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
              <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">メモ</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{meeting.memo}</p>
            </div>
          )}

          {meeting.status === 'processing' && (
            <div className="bg-white border border-[#F0F0F0] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">⏳</div>
              <p className="text-sm font-bold text-[#1A1A1A]">AIが解析中です...</p>
              <p className="text-xs text-[#9B9B9B]">このページを更新すると最新の状態が表示されます</p>
            </div>
          )}

          {meeting.status === 'error' && (
            <div className="bg-white border border-[#F0F0F0] rounded-xl p-8 flex flex-col items-center gap-3 text-center">
              <div className="text-3xl">⚠️</div>
              <p className="text-sm font-bold text-[#E15252]">解析中にエラーが発生しました</p>
              {meeting.error_message && <p className="text-xs text-[#9B9B9B]">{meeting.error_message}</p>}
            </div>
          )}

          {meeting.status === 'done' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
                  <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">KGI（最終目標）</p>
                  <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{meeting.kgi || '-'}</p>
                </div>
                <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
                  <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">KPI（重要指標）</p>
                  <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{meeting.kpi || '-'}</p>
                </div>
              </div>

              {pdca && (
                <div>
                  <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">PDCA</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {([
                      ['Plan', pdca.plan],
                      ['Do', pdca.do],
                      ['Check', pdca.check],
                      ['Act', pdca.act],
                    ] as const).map(([label, text]) => (
                      <div key={label} className="bg-white border border-[#F0F0F0] rounded-xl p-5">
                        <p className="text-xs font-bold text-[#1A1A1A] mb-2">{label}</p>
                        <p className="text-sm text-[#9B9B9B] whitespace-pre-wrap">{text || '-'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">タスクリスト</p>
                {tasks.length === 0 ? (
                  <p className="text-sm text-[#9B9B9B]">タスクは抽出されませんでした</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {tasks.map((task, i) => {
                      const meta = PRIORITY_META[task.priority] || PRIORITY_META.medium
                      return (
                        <div key={i} className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-3">
                          <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: meta.color, background: meta.bg }}>
                            {meta.label}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-[#1A1A1A] truncate">{task.title}</p>
                            <p className="text-xs text-[#9B9B9B]">
                              {task.assignee || '担当者未設定'}{task.due_date ? ` ・ 納期: ${task.due_date}` : ''}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {meeting.transcript && (
                <details className="bg-white border border-[#F0F0F0] rounded-xl p-5">
                  <summary className="text-xs font-bold text-[#E15252] tracking-wider cursor-pointer">文字起こしを表示</summary>
                  <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap mt-3">{meeting.transcript}</p>
                </details>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

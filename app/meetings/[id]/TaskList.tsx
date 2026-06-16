'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskItem {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  assignee: string
  done?: boolean
  status?: '未着手' | '進行中' | '完了'
}

type Status = '未着手' | '進行中' | '完了'
const STATUSES: Status[] = ['未着手', '進行中', '完了']
const STATUS_ICON: Record<Status, string> = { '完了': '✅', '進行中': '▶', '未着手': '・' }

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: '高', color: '#E15252', bg: '#FCEAE3' },
  medium: { label: '中', color: '#C6A23A', bg: '#FBF6E3' },
  low:    { label: '低', color: '#4FAF7A', bg: '#E8F6EF' },
}

const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }
const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 }

function getStatus(task: TaskItem): Status {
  return task.status ?? (task.done ? '完了' : '未着手')
}

function buildTaskSection(tasks: TaskItem[]): string {
  const taskLines = tasks.map(task => {
    const meta = [`優先度: ${PRIORITY_LABEL[task.priority] || task.priority}`]
    if (task.assignee) meta.push(`担当: ${task.assignee}`)
    if (task.due_date) meta.push(`納期: ${task.due_date}`)
    const status = getStatus(task)
    meta.push(`ステータス: ${status}`)
    return `${STATUS_ICON[status]}${task.title}（${meta.join(' / ')}）`
  })
  return `✅ タスクリスト\n${taskLines.join('\n')}`
}

function applyTaskSection(notes: string, tasks: TaskItem[]): string {
  const section = buildTaskSection(tasks)
  if (/✅ タスクリスト\n[\s\S]*?(?=\n\n|$)/.test(notes)) {
    return notes.replace(/✅ タスクリスト\n[\s\S]*?(?=\n\n|$)/, section)
  }
  return notes ? `${notes}\n\n${section}` : section
}

function ReportForm({ meetingId, taskTitle, onDone }: { meetingId: string; taskTitle: string; onDone: () => void }) {
  const router = useRouter()
  const [content, setContent] = useState('')
  const [url, setUrl] = useState('')
  const [insight, setInsight] = useState('')
  const [improvement, setImprovement] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setSubmitting(true)
    setError('')
    const supabase = createClient()

    const photoUrls: string[] = []
    for (const file of files) {
      const path = `${Date.now()}-${file.name}`
      const { error: uploadError } = await supabase.storage.from('post-images').upload(path, file, { contentType: file.type })
      if (uploadError) {
        setSubmitting(false)
        setError(`画像のアップロードに失敗しました: ${file.name}`)
        return
      }
      const { data } = supabase.storage.from('post-images').getPublicUrl(path)
      photoUrls.push(data.publicUrl)
    }

    const { data: { user } } = await supabase.auth.getUser()
    let authorName = 'ゲスト'
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('display_name').eq('id', user.id).single()
      authorName = profile?.display_name || 'ゲスト'
    }

    const { error: insertError } = await supabase.from('task_reports').insert({
      meeting_id: meetingId,
      task_title: taskTitle,
      content: content.trim() || null,
      photo_urls: photoUrls,
      url: url.trim() || null,
      insight: insight.trim() || null,
      improvement: improvement.trim() || null,
      author_name: authorName,
      user_id: user?.id ?? null,
    })

    setSubmitting(false)
    if (insertError) {
      setError('報告の送信に失敗しました')
      return
    }

    onDone()
    router.refresh()
  }

  return (
    <div className="bg-[#F9F9F9] border border-[#F0F0F0] rounded-xl p-4 flex flex-col gap-3">
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">やったこと</label>
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none" />
      </div>
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">写真</label>
        <input type="file" accept="image/*" multiple onChange={e => setFiles(Array.from(e.target.files || []))} className="w-full text-xs text-[#1A1A1A]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">URL</label>
        <input type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
      </div>
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">気づき</label>
        <textarea value={insight} onChange={e => setInsight(e.target.value)} rows={2} className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none" />
      </div>
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">次回改善点</label>
        <textarea value={improvement} onChange={e => setImprovement(e.target.value)} rows={2} className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none" />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSubmit} disabled={submitting} className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50">
          {submitting ? '送信中...' : '送信'}
        </button>
        <button onClick={onDone} className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
          キャンセル
        </button>
      </div>
    </div>
  )
}

export default function TaskList({
  meetingId,
  initialTasks,
  initialNotes,
  postId,
}: {
  meetingId: string
  initialTasks: TaskItem[]
  initialNotes: string
  postId: string | null
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks)
  const [notes, setNotes] = useState(initialNotes)
  const [reportIndex, setReportIndex] = useState<number | null>(null)

  async function persist(next: TaskItem[]) {
    setTasks(next)
    const newNotes = applyTaskSection(notes, next)
    setNotes(newNotes)
    const supabase = createClient()
    await supabase.from('meetings').update({ tasks: next, notes: newNotes }).eq('id', meetingId)
    if (postId) {
      await supabase.from('posts').update({ body: newNotes }).eq('id', postId)
    }
  }

  function setStatus(i: number, status: Status) {
    persist(tasks.map((t, idx) => idx === i ? { ...t, status, done: status === '完了' } : t))
  }

  function toggleDone(i: number) {
    setStatus(i, getStatus(tasks[i]) === '完了' ? '未着手' : '完了')
  }

  function setAssignee(i: number, assignee: string) {
    persist(tasks.map((t, idx) => idx === i ? { ...t, assignee } : t))
  }

  function setDueDate(i: number, due_date: string) {
    persist(tasks.map((t, idx) => idx === i ? { ...t, due_date } : t))
  }

  if (tasks.length === 0) {
    return <p className="text-sm text-[#9B9B9B]">タスクは抽出されませんでした</p>
  }

  const total = tasks.length
  const completed = tasks.filter(t => getStatus(t) === '完了').length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0

  const topTasks = tasks
    .map((t, i) => ({ ...t, _i: i }))
    .filter(t => getStatus(t) !== '完了')
    .sort((a, b) => {
      const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      if (pd !== 0) return pd
      if (!a.due_date) return 1
      if (!b.due_date) return -1
      return a.due_date.localeCompare(b.due_date)
    })
    .slice(0, 3)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">② アクションプラン</p>

        {topTasks.length > 0 && (
          <div className="flex flex-col gap-2 mb-3">
            <p className="text-xs font-bold text-[#1A1A1A]">🔥 今週の最優先タスク</p>
            {topTasks.map(task => {
              const meta = PRIORITY_META[task.priority] || PRIORITY_META.medium
              const taskStatus = getStatus(tasks[task._i])
              return (
                <div key={task._i} className="bg-white border border-[#F0F0F0] rounded-xl p-3 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={taskStatus === '完了'}
                    onChange={() => toggleDone(task._i)}
                    className="w-5 h-5 accent-[#E15252] flex-shrink-0"
                  />
                  <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: meta.color, background: meta.bg }}>
                    {meta.label}
                  </span>
                  <p className={`flex-1 min-w-0 text-sm font-bold truncate ${taskStatus === '完了' ? 'text-[#C4C4C4] line-through' : 'text-[#1A1A1A]'}`}>{task.title}</p>
                  {task.due_date && <p className="text-xs text-[#9B9B9B] whitespace-nowrap">{task.due_date}</p>}
                </div>
              )
            })}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {tasks.map((task, i) => {
            const meta = PRIORITY_META[task.priority] || PRIORITY_META.medium
            const status = getStatus(task)
            return (
              <div key={i} className="flex flex-col gap-2">
                <div className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-2 flex-wrap">
                  <input
                    type="checkbox"
                    checked={status === '完了'}
                    onChange={() => toggleDone(i)}
                    className="w-5 h-5 accent-[#E15252] flex-shrink-0"
                  />
                  <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: meta.color, background: meta.bg }}>
                    {meta.label}
                  </span>
                  <p className={`flex-1 min-w-[100px] text-sm font-bold truncate ${status === '完了' ? 'text-[#C4C4C4] line-through' : 'text-[#1A1A1A]'}`}>{task.title}</p>
                  <input
                    type="text"
                    defaultValue={task.assignee}
                    onBlur={e => setAssignee(i, e.target.value)}
                    placeholder="担当者"
                    className="w-24 text-xs text-[#1A1A1A] bg-white border border-[#F0F0F0] rounded-lg px-2 py-1.5 outline-none focus:border-[#E15252]"
                  />
                  <input
                    type="date"
                    value={task.due_date || ''}
                    onChange={e => setDueDate(i, e.target.value)}
                    className="text-xs text-[#1A1A1A] bg-white border border-[#F0F0F0] rounded-lg px-2 py-1.5 outline-none focus:border-[#E15252]"
                  />
                  <select
                    value={status}
                    onChange={e => setStatus(i, e.target.value as Status)}
                    className="text-xs text-[#1A1A1A] bg-white border border-[#F0F0F0] rounded-lg px-2 py-1.5 outline-none focus:border-[#E15252]"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button
                    onClick={() => setReportIndex(reportIndex === i ? null : i)}
                    className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252] whitespace-nowrap"
                  >
                    {reportIndex === i ? '閉じる' : '報告する'}
                  </button>
                </div>
                {reportIndex === i && (
                  <ReportForm meetingId={meetingId} taskTitle={task.title} onDone={() => setReportIndex(null)} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <p className="text-xs font-bold text-[#E15252] mb-2 tracking-wider">③ 進捗管理</p>
        <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold text-[#1A1A1A]">進捗率 {percent}%</p>
            <p className="text-xs text-[#9B9B9B]">{completed} / {total} 完了</p>
          </div>
          <div className="w-full h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
            <div className="h-full rounded-full bg-[#E15252]" style={{ width: `${percent}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

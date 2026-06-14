'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TaskItem {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  assignee: string
  done?: boolean
}

const PRIORITY_META: Record<string, { label: string; color: string; bg: string }> = {
  high:   { label: '高', color: '#E15252', bg: '#FCEAE3' },
  medium: { label: '中', color: '#C6A23A', bg: '#FBF6E3' },
  low:    { label: '低', color: '#4FAF7A', bg: '#E8F6EF' },
}

const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }

function buildTaskSection(tasks: TaskItem[]): string {
  const taskLines = tasks.map(task => {
    const meta = [`優先度: ${PRIORITY_LABEL[task.priority] || task.priority}`]
    if (task.assignee) meta.push(`担当: ${task.assignee}`)
    if (task.due_date) meta.push(`納期: ${task.due_date}`)
    return `${task.done ? '✅' : '・'}${task.title}（${meta.join(' / ')}）`
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

  if (tasks.length === 0) {
    return <p className="text-sm text-[#9B9B9B]">タスクは抽出されませんでした</p>
  }

  return (
    <div className="flex flex-col gap-2">
      {tasks.map((task, i) => {
        const meta = PRIORITY_META[task.priority] || PRIORITY_META.medium
        return (
          <div key={i} className="bg-white border border-[#F0F0F0] rounded-xl p-4 flex items-center gap-3">
            <input
              type="checkbox"
              checked={!!task.done}
              onChange={() => persist(tasks.map((t, idx) => idx === i ? { ...t, done: !t.done } : t))}
              className="w-5 h-5 accent-[#E15252] flex-shrink-0"
            />
            <span className="px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap" style={{ color: meta.color, background: meta.bg }}>
              {meta.label}
            </span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold truncate ${task.done ? 'text-[#C4C4C4] line-through' : 'text-[#1A1A1A]'}`}>{task.title}</p>
              <p className="text-xs text-[#9B9B9B] truncate">{task.assignee || '担当者未設定'}</p>
            </div>
            <input
              type="date"
              value={task.due_date || ''}
              onChange={e => persist(tasks.map((t, idx) => idx === i ? { ...t, due_date: e.target.value } : t))}
              className="text-xs text-[#1A1A1A] bg-white border border-[#F0F0F0] rounded-lg px-2 py-1.5 outline-none focus:border-[#E15252]"
            />
          </div>
        )
      })}
    </div>
  )
}

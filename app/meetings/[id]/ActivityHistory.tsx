'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TaskReport {
  id: string
  task_title: string | null
  content: string | null
  photo_urls: string[] | null
  url: string | null
  insight: string | null
  improvement: string | null
  author_name: string | null
  created_at: string
}

function ReportCard({ report, onUpdated, onDeleted }: {
  report: TaskReport
  onUpdated: (r: TaskReport) => void
  onDeleted: (id: string) => void
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [taskTitle, setTaskTitle] = useState(report.task_title || '')
  const [content, setContent] = useState(report.content || '')
  const [url, setUrl] = useState(report.url || '')
  const [insight, setInsight] = useState(report.insight || '')
  const [improvement, setImprovement] = useState(report.improvement || '')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const updates = {
      task_title: taskTitle.trim() || null,
      content: content.trim() || null,
      url: url.trim() || null,
      insight: insight.trim() || null,
      improvement: improvement.trim() || null,
    }
    await supabase.from('task_reports').update(updates).eq('id', report.id)
    setSaving(false)
    setEditing(false)
    onUpdated({ ...report, ...updates })
    router.refresh()
  }

  async function handleDelete() {
    if (!window.confirm('この活動記録を削除しますか？（元に戻せません）')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('task_reports').delete().eq('id', report.id)
    onDeleted(report.id)
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#F0F0F0] rounded-xl p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        {editing ? (
          <input
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="タスク名"
            className="flex-1 bg-white border border-[#F0F0F0] rounded-lg px-3 py-1.5 text-sm font-bold text-[#1A1A1A] outline-none focus:border-[#E15252]"
          />
        ) : (
          <p className="text-sm font-bold text-[#1A1A1A] truncate">{report.task_title}</p>
        )}
        <p className="text-xs text-[#9B9B9B] whitespace-nowrap">{new Date(report.created_at).toLocaleString('ja-JP')}</p>
      </div>

      {report.author_name && <p className="text-xs text-[#9B9B9B]">{report.author_name}</p>}

      {editing ? (
        <div className="flex flex-col gap-3 mt-1">
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">やったこと</label>
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={3} className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none" />
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
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setTaskTitle(report.task_title||''); setContent(report.content||''); setUrl(report.url||''); setInsight(report.insight||''); setImprovement(report.improvement||'') }} className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <>
          {report.content && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">やったこと</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.content}</p>
            </div>
          )}
          {report.photo_urls && report.photo_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {report.photo_urls.map((photoUrl, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={photoUrl} alt="" className="w-full h-20 object-cover rounded-lg border border-[#F0F0F0]" />
              ))}
            </div>
          )}
          {report.url && (
            <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E15252] underline break-all">
              {report.url}
            </a>
          )}
          {report.insight && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">気づき</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.insight}</p>
            </div>
          )}
          {report.improvement && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">次回改善点</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.improvement}</p>
            </div>
          )}
          <div className="flex gap-2 mt-1 pt-2 border-t border-[#F0F0F0]">
            <button onClick={() => setEditing(true)} className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
              編集
            </button>
            <button onClick={handleDelete} disabled={deleting} className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252] disabled:opacity-50">
              {deleting ? '削除中...' : '削除'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ActivityHistory({ reports: initialReports }: { reports: TaskReport[] }) {
  const [reports, setReports] = useState<TaskReport[]>(initialReports)

  if (reports.length === 0) {
    return <p className="text-sm text-[#9B9B9B]">まだ活動履歴がありません</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map(report => (
        <ReportCard
          key={report.id}
          report={report}
          onUpdated={updated => setReports(prev => prev.map(r => r.id === updated.id ? updated : r))}
          onDeleted={id => setReports(prev => prev.filter(r => r.id !== id))}
        />
      ))}
    </div>
  )
}

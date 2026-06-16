'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MeetingEditor({
  id,
  initialTitle,
  initialMemo,
  initialSummary,
  initialDecisions,
  initialKgi,
  initialNotes,
  postId,
  canDelete,
}: {
  id: string
  initialTitle: string
  initialMemo: string
  initialSummary: string
  initialDecisions: string
  initialKgi: string
  initialNotes: string
  postId: string | null
  canDelete: boolean
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [memo, setMemo] = useState(initialMemo)
  const [summary, setSummary] = useState(initialSummary)
  const [decisions, setDecisions] = useState(initialDecisions)
  const [kgi, setKgi] = useState(initialKgi)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function applyMemoSection(notes: string, memoText: string): string {
    let rest = notes
    const match = notes.match(/^📒 メモ\n[\s\S]*?(?:\n\n|$)/)
    if (match) rest = notes.slice(match[0].length)
    if (!memoText.trim()) return rest
    const section = `📒 メモ\n${memoText}`
    return rest ? `${section}\n\n${rest}` : section
  }

  function cancel() {
    setEditing(false)
    setTitle(initialTitle)
    setMemo(initialMemo)
    setSummary(initialSummary)
    setDecisions(initialDecisions)
    setKgi(initialKgi)
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const newTitle = title.trim() || '無題のミーティング'
    const newNotes = applyMemoSection(initialNotes, memo)
    await supabase
      .from('meetings')
      .update({
        title: newTitle,
        memo,
        summary: summary.trim() || null,
        decisions: decisions.trim() || null,
        kgi: kgi.trim() || null,
        notes: newNotes,
      })
      .eq('id', id)
    if (postId) {
      await supabase.from('posts').update({ title: newTitle, body: newNotes }).eq('id', postId)
    }
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  async function handleDelete() {
    if (!window.confirm('このミーティングログを削除します。よろしいですか？（元に戻せません）')) return
    setDeleting(true)
    const supabase = createClient()
    await supabase.from('meetings').delete().eq('id', id)
    if (postId) {
      await supabase.from('posts').delete().eq('id', postId)
    }
    router.push('/meetings')
  }

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]"
        >
          編集
        </button>
        {canDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252] disabled:opacity-50"
          >
            {deleting ? '削除中...' : '削除'}
          </button>
        )}
      </div>
    )
  }

  const inp = "w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
  const lbl = "block text-xs font-bold text-[#E15252] mb-2 tracking-wider"

  return (
    <div className="bg-white border border-[#F0F0F0] rounded-xl p-5 flex flex-col gap-4">
      <div>
        <label className={lbl}>タイトル</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className={inp} />
      </div>
      <div>
        <label className={lbl}>📝 要約</label>
        <textarea value={summary} onChange={e => setSummary(e.target.value)} rows={4} placeholder="会議の要約を入力" className={`${inp} resize-none`} />
      </div>
      <div>
        <label className={lbl}>📌 決定事項</label>
        <textarea value={decisions} onChange={e => setDecisions(e.target.value)} rows={4} placeholder="決定事項を入力" className={`${inp} resize-none`} />
      </div>
      <div>
        <label className={lbl}>🎯 KGI（最終目標）</label>
        <input value={kgi} onChange={e => setKgi(e.target.value)} placeholder="最終目標を入力" className={inp} />
      </div>
      <div>
        <label className={lbl}>📒 メモ</label>
        <textarea value={memo} onChange={e => setMemo(e.target.value)} rows={3} placeholder="メモを入力" className={`${inp} resize-none`} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50"
        >
          {saving ? '保存中...' : '保存'}
        </button>
        <button
          onClick={cancel}
          className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function MeetingEditor({
  id,
  initialTitle,
  initialMemo,
  initialNotes,
  postId,
}: {
  id: string
  initialTitle: string
  initialMemo: string
  initialNotes: string
  postId: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(initialTitle)
  const [memo, setMemo] = useState(initialMemo)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function applyMemoSection(notes: string, memo: string): string {
    let rest = notes
    const match = notes.match(/^📒 メモ\n[\s\S]*?(?:\n\n|$)/)
    if (match) rest = notes.slice(match[0].length)
    if (!memo.trim()) return rest
    const section = `📒 メモ\n${memo}`
    return rest ? `${section}\n\n${rest}` : section
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const newTitle = title.trim() || '無題のミーティング'
    const newNotes = applyMemoSection(initialNotes, memo)
    await supabase
      .from('meetings')
      .update({ title: newTitle, memo, notes: newNotes })
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
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252] disabled:opacity-50"
        >
          {deleting ? '削除中...' : '削除'}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white border border-[#F0F0F0] rounded-xl p-5 flex flex-col gap-3">
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">タイトル</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">メモ</label>
        <textarea
          value={memo}
          onChange={e => setMemo(e.target.value)}
          rows={4}
          placeholder="メモを入力"
          className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none"
        />
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
          onClick={() => { setEditing(false); setTitle(initialTitle); setMemo(initialMemo) }}
          className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]"
        >
          キャンセル
        </button>
      </div>
    </div>
  )
}

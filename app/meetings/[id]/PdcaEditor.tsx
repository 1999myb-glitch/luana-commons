'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface PdcaResult {
  plan: string
  do: string
  check: string
  act: string
  next?: string
}

const FIELDS: { key: keyof PdcaResult; label: string }[] = [
  { key: 'plan', label: 'Plan' },
  { key: 'do', label: 'Do' },
  { key: 'check', label: 'Check' },
  { key: 'act', label: 'Act' },
  { key: 'next', label: '次回やること' },
]

export default function PdcaEditor({ meetingId, initialPdca }: { meetingId: string; initialPdca: PdcaResult }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [values, setValues] = useState<PdcaResult>(initialPdca)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('meetings').update({ pdca: values }).eq('id', meetingId)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[#E15252] tracking-wider">④ PDCA</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-3 py-1 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key}>
              <label className="block text-xs font-bold text-[#1A1A1A] mb-1">{label}</label>
              <textarea
                value={values[key] || ''}
                onChange={e => setValues(v => ({ ...v, [key]: e.target.value }))}
                rows={2}
                className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none"
              />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setValues(initialPdca) }} className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FIELDS.map(({ key, label }) => (
            <div key={key} className="bg-white border border-[#F0F0F0] rounded-xl p-5">
              <p className="text-xs font-bold text-[#1A1A1A] mb-2">{label}</p>
              <p className="text-sm text-[#9B9B9B] whitespace-pre-wrap">{values[key] || '-'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

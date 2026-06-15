'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function parseNumber(value: string): number | null {
  const match = value.match(/[\d.]+/)
  if (!match) return null
  const num = parseFloat(match[0])
  return Number.isNaN(num) ? null : num
}

export default function KpiCard({
  meetingId,
  kpiDescription,
  initialTarget,
  initialActual,
}: {
  meetingId: string
  kpiDescription: string
  initialTarget: string | null
  initialActual: string | null
}) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [target, setTarget] = useState(initialTarget || '')
  const [actual, setActual] = useState(initialActual || '')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('meetings').update({ kpi_target: target, kpi_actual: actual }).eq('id', meetingId)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  const targetNum = parseNumber(target)
  const actualNum = parseNumber(actual)
  const rate = targetNum !== null && targetNum !== 0 && actualNum !== null
    ? Math.round((actualNum / targetNum) * 1000) / 10
    : null

  return (
    <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[#E15252] tracking-wider">KPI（重要指標）</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-3 py-1 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
            編集
          </button>
        )}
      </div>
      <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap mb-3">{kpiDescription || '-'}</p>

      {editing ? (
        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">目標</label>
            <input value={target} onChange={e => setTarget(e.target.value)} placeholder="例: 100件" className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-1 tracking-wider">実績</label>
            <input value={actual} onChange={e => setActual(e.target.value)} placeholder="例: 80件" className="w-full bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button
              onClick={() => { setEditing(false); setTarget(initialTarget || ''); setActual(initialActual || '') }}
              className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <p className="text-xs text-[#9B9B9B] mb-1">目標</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{target || '-'}</p>
          </div>
          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <p className="text-xs text-[#9B9B9B] mb-1">実績</p>
            <p className="text-sm font-bold text-[#1A1A1A]">{actual || '-'}</p>
          </div>
          <div className="bg-[#F9F9F9] rounded-lg p-3">
            <p className="text-xs text-[#9B9B9B] mb-1">達成率</p>
            <p className="text-sm font-bold text-[#E15252]">{rate !== null ? `${rate}%` : '-'}</p>
          </div>
        </div>
      )}
    </div>
  )
}

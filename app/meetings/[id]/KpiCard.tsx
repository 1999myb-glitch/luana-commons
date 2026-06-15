'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface KpiItem {
  name: string
  target: string
  actual: string
  unit: string
}

function parseNumber(value: string): number | null {
  const match = value.match(/[\d.]+/)
  if (!match) return null
  const num = parseFloat(match[0])
  return Number.isNaN(num) ? null : num
}

function rateOf(item: KpiItem): number | null {
  const targetNum = parseNumber(item.target)
  const actualNum = parseNumber(item.actual)
  return targetNum !== null && targetNum !== 0 && actualNum !== null
    ? Math.round((actualNum / targetNum) * 1000) / 10
    : null
}

export default function KpiCard({ meetingId, initialKpis }: { meetingId: string; initialKpis: KpiItem[] }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [kpis, setKpis] = useState<KpiItem[]>(initialKpis)
  const [saving, setSaving] = useState(false)

  function updateField(i: number, field: keyof KpiItem, value: string) {
    setKpis(prev => prev.map((k, idx) => idx === i ? { ...k, [field]: value } : k))
  }

  function addKpi() {
    setKpis(prev => [...prev, { name: '', target: '', actual: '', unit: '' }])
  }

  function removeKpi(i: number) {
    setKpis(prev => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('meetings').update({ kpis }).eq('id', meetingId)
    setSaving(false)
    setEditing(false)
    router.refresh()
  }

  return (
    <div className="bg-white border border-[#F0F0F0] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold text-[#E15252] tracking-wider">KPI（重要指標）</p>
        {!editing && (
          <button onClick={() => setEditing(true)} className="px-3 py-1 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
            編集
          </button>
        )}
      </div>

      {editing ? (
        <div className="flex flex-col gap-3">
          {kpis.map((k, i) => (
            <div key={i} className="border border-[#F0F0F0] rounded-lg p-3 flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <input
                  value={k.name}
                  onChange={e => updateField(i, 'name', e.target.value)}
                  placeholder="KPI名（例: チラシ配布数）"
                  className="flex-1 bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]"
                />
                <button onClick={() => removeKpi(i)} className="w-8 h-8 flex-shrink-0 rounded-lg border border-[#F0F0F0] bg-white text-xs font-bold text-[#9B9B9B]">
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <input value={k.target} onChange={e => updateField(i, 'target', e.target.value)} placeholder="目標" className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
                <input value={k.actual} onChange={e => updateField(i, 'actual', e.target.value)} placeholder="実績" className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
                <input value={k.unit} onChange={e => updateField(i, 'unit', e.target.value)} placeholder="単位" className="bg-white border border-[#F0F0F0] rounded-lg px-3 py-2 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
              </div>
            </div>
          ))}
          <button onClick={addKpi} className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#E15252]">
            ＋ KPIを追加
          </button>
          <div className="flex gap-2">
            <button onClick={handleSave} disabled={saving} className="px-4 py-2 rounded-full bg-[#E15252] text-white text-xs font-bold disabled:opacity-50">
              {saving ? '保存中...' : '保存'}
            </button>
            <button onClick={() => { setEditing(false); setKpis(initialKpis) }} className="px-4 py-2 rounded-full border border-[#F0F0F0] bg-white text-xs font-bold text-[#1A1A1A]">
              キャンセル
            </button>
          </div>
        </div>
      ) : kpis.length === 0 ? (
        <p className="text-sm text-[#9B9B9B]">KPIが設定されていません</p>
      ) : (
        <div className="flex flex-col gap-4">
          {kpis.map((k, i) => {
            const rate = rateOf(k)
            return (
              <div key={i}>
                <p className="text-sm font-bold text-[#1A1A1A] mb-2">{k.name || '(名称未設定)'}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#F9F9F9] rounded-lg p-3">
                    <p className="text-xs text-[#9B9B9B] mb-1">目標</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{k.target ? `${k.target}${k.unit}` : '-'}</p>
                  </div>
                  <div className="bg-[#F9F9F9] rounded-lg p-3">
                    <p className="text-xs text-[#9B9B9B] mb-1">実績</p>
                    <p className="text-sm font-bold text-[#1A1A1A]">{k.actual ? `${k.actual}${k.unit}` : '-'}</p>
                  </div>
                  <div className="bg-[#F9F9F9] rounded-lg p-3">
                    <p className="text-xs text-[#9B9B9B] mb-1">達成率</p>
                    <p className="text-sm font-bold text-[#E15252]">{rate !== null ? `${rate}%` : '-'}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

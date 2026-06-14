'use client'
import { useState } from 'react'

export default function ShareButton() {
  const [copied, setCopied] = useState(false)

  async function handleClick() {
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button onClick={handleClick} className="px-4 py-2 rounded-full text-xs font-bold border-2 border-[#E15252] text-[#E15252] bg-white whitespace-nowrap">
      {copied ? 'コピーしました ✓' : '🔗 共有リンクをコピー'}
    </button>
  )
}

'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewMeeting() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  async function startRecording() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = e => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      recorder.start()
      mediaRecorderRef.current = recorder
      setRecording(true)
      setSeconds(0)
      setAudioBlob(null)
      setAudioUrl('')
      timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
    } catch {
      setError('マイクへのアクセスが許可されていません')
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecording(false)
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function formatTime(total: number) {
    const m = Math.floor(total / 60).toString().padStart(2, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function handleSubmit() {
    if (!audioBlob) return setError('録音データがありません')
    setError('')
    setLoading(true)
    setLoadingMessage('音声をアップロードしています...')
    const supabase = createClient()

    const path = `${Date.now()}-meeting.webm`
    const { error: uploadError } = await supabase.storage
      .from('meeting-audio')
      .upload(path, audioBlob, { contentType: 'audio/webm' })
    if (uploadError) {
      setLoading(false)
      return setError('音声のアップロードに失敗しました: ' + uploadError.message)
    }
    const { data: urlData } = supabase.storage.from('meeting-audio').getPublicUrl(path)

    const { data: meeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        title: title.trim() || '無題のミーティング',
        status: 'processing',
        audio_url: urlData.publicUrl,
      })
      .select()
      .single()

    if (insertError || !meeting) {
      setLoading(false)
      return setError('ミーティングの作成に失敗しました')
    }

    setLoadingMessage('AIが解析しています...（1分ほどかかります）')
    const res = await fetch('/api/meetings/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: meeting.id }),
    })

    setLoading(false)
    if (!res.ok) {
      return router.push(`/meetings/${meeting.id}`)
    }
    router.push(`/meetings/${meeting.id}`)
  }

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/meetings" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">📋</Link>
          <h1 className="text-lg font-black text-[#1A1A1A]">ミーティングを録音</h1>
        </header>

        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">タイトル（任意）</label>
            <input value={title} onChange={e => setTitle(e.target.value)} placeholder="例: 週次定例ミーティング" className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252]" />
          </div>

          <div className="bg-white border border-[#F0F0F0] rounded-xl p-8 flex flex-col items-center gap-4">
            <div className="text-4xl font-black text-[#1A1A1A] tabular-nums">{formatTime(seconds)}</div>
            {recording && (
              <div className="flex items-center gap-2 text-xs font-bold text-[#E15252]">
                <span className="w-2 h-2 rounded-full bg-[#E15252] animate-pulse" />
                録音中...
              </div>
            )}
            {!recording ? (
              <button onClick={startRecording} className="px-8 py-3 bg-[#E15252] text-white font-bold text-sm rounded-full">
                ● 録音開始
              </button>
            ) : (
              <button onClick={stopRecording} className="px-8 py-3 bg-[#1A1A1A] text-white font-bold text-sm rounded-full">
                ■ 録音停止
              </button>
            )}
            {audioUrl && !recording && (
              <audio controls src={audioUrl} className="w-full mt-2" />
            )}
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={loading || !audioBlob} className="w-full py-4 bg-[#E15252] text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {loading ? loadingMessage || '処理中...' : 'アップロードして解析する'}
          </button>
        </div>
      </div>
    </main>
  )
}

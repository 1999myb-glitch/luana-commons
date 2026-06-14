'use client'
import { useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface SpeechRecognitionResultLike {
  isFinal: boolean
  0: { transcript: string }
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<SpeechRecognitionResultLike>
}

interface SpeechRecognitionInstance {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: Event) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

export default function NewMeeting() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [transcript, setTranscript] = useState('')
  const [interim, setInterim] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [error, setError] = useState('')

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)
  const transcriptRef = useRef('')
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const recordingRef = useRef(false)

  function startRecording() {
    setError('')
    const Ctor = getSpeechRecognitionCtor()
    if (!Ctor) {
      setError('お使いのブラウザは音声入力に対応していません（Chrome推奨）')
      return
    }

    transcriptRef.current = ''
    setTranscript('')
    setInterim('')
    setSeconds(0)

    const recognition = new Ctor()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalText += result[0].transcript
        } else {
          interimText += result[0].transcript
        }
      }
      if (finalText) {
        transcriptRef.current += finalText
        setTranscript(transcriptRef.current)
      }
      setInterim(interimText)
    }

    recognition.onerror = () => {
      setError('音声認識中にエラーが発生しました')
    }

    recognition.onend = () => {
      if (recognitionRef.current === recognition && recordingRef.current) {
        recognition.start()
      }
    }

    recognition.start()
    recognitionRef.current = recognition
    recordingRef.current = true
    setRecording(true)
    timerRef.current = setInterval(() => setSeconds(s => s + 1), 1000)
  }

  function stopRecording() {
    recordingRef.current = false
    setRecording(false)
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setInterim('')
    if (timerRef.current) clearInterval(timerRef.current)
  }

  function formatTime(total: number) {
    const m = Math.floor(total / 60).toString().padStart(2, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  async function handleSubmit() {
    if (!transcript.trim()) return setError('文字起こしがありません')
    setError('')
    setLoading(true)
    setLoadingMessage('保存しています...')
    const supabase = createClient()

    const { data: meeting, error: insertError } = await supabase
      .from('meetings')
      .insert({
        title: title.trim() || '無題のミーティング',
        status: 'processing',
        transcript,
      })
      .select()
      .single()

    if (insertError || !meeting) {
      setLoading(false)
      return setError('ミーティングの作成に失敗しました')
    }

    setLoadingMessage('AIが解析しています...')
    await fetch('/api/meetings/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: meeting.id }),
    })

    setLoading(false)
    router.push(`/meetings/${meeting.id}`)
  }

  return (
    <main className="min-h-screen bg-[#F3F3F3]">
      <div className="max-w-2xl mx-auto px-4 pb-20">
        <header className="py-5 flex items-center gap-3">
          <Link href="/meetings" className="w-8 h-8 rounded-lg bg-[#E15252] flex items-center justify-center text-white text-sm">📋</Link>
          <h1 className="text-lg font-black text-[#1A1A1A]">ミーティングを記録</h1>
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
                音声入力中...
              </div>
            )}
            {!recording ? (
              <button onClick={startRecording} className="px-8 py-3 bg-[#E15252] text-white font-bold text-sm rounded-full">
                ● 音声入力開始
              </button>
            ) : (
              <button onClick={stopRecording} className="px-8 py-3 bg-[#1A1A1A] text-white font-bold text-sm rounded-full">
                ■ 停止
              </button>
            )}
          </div>

          {(transcript || interim) && (
            <div>
              <label className="block text-xs font-bold text-[#E15252] mb-2 tracking-wider">文字起こし</label>
              <textarea
                value={transcript}
                onChange={e => { transcriptRef.current = e.target.value; setTranscript(e.target.value) }}
                rows={8}
                className="w-full bg-white border border-[#F0F0F0] rounded-xl px-4 py-3 text-sm text-[#1A1A1A] outline-none focus:border-[#E15252] resize-none"
              />
              {interim && <p className="text-xs text-[#9B9B9B] mt-2">{interim}</p>}
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <button onClick={handleSubmit} disabled={loading || !transcript.trim()} className="w-full py-4 bg-[#E15252] text-white font-bold text-sm rounded-xl disabled:opacity-50">
            {loading ? loadingMessage || '処理中...' : '保存してAI解析する'}
          </button>
        </div>
      </div>
    </main>
  )
}

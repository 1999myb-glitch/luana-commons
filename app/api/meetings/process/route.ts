import { createClient } from '@/lib/supabase/server'
import { NextRequest } from 'next/server'

interface PdcaResult {
  plan: string
  do: string
  check: string
  act: string
}

interface TaskItem {
  title: string
  priority: 'high' | 'medium' | 'low'
  due_date: string
  assignee: string
}

interface AnalysisResult {
  kgi: string
  kpi: string
  pdca: PdcaResult
  tasks: TaskItem[]
}

export async function POST(request: NextRequest) {
  const { id } = await request.json()
  const supabase = await createClient()

  const { data: meeting, error: fetchError } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !meeting) {
    return Response.json({ error: 'meeting not found' }, { status: 404 })
  }

  try {
    const audioRes = await fetch(meeting.audio_url)
    const audioBlob = await audioRes.blob()

    const whisperForm = new FormData()
    whisperForm.append('file', audioBlob, 'audio.webm')
    whisperForm.append('model', 'whisper-1')

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: whisperForm,
    })

    if (!whisperRes.ok) {
      throw new Error(`Whisper APIエラー: ${whisperRes.status}`)
    }

    const whisperData = await whisperRes.json()
    const transcript = whisperData.text as string

    const prompt = `以下は会議の文字起こしです。この内容を分析し、次のJSON形式のみを厳密に出力してください（説明文やコードブロックの記号は一切付けず、JSONのみを出力すること）。

{"kgi": "最終目標(KGI)の説明", "kpi": "重要指標(KPI)の説明", "pdca": {"plan": "計画の内容", "do": "実行内容", "check": "評価内容", "act": "改善内容"}, "tasks": [{"title": "タスク名", "priority": "high または medium または low", "due_date": "YYYY-MM-DD形式、不明な場合は空文字", "assignee": "担当者・役割、不明な場合は空文字"}]}

文字起こし:
${transcript}`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY!,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      throw new Error(`Claude APIエラー: ${claudeRes.status}`)
    }

    const claudeData = await claudeRes.json()
    const responseText = claudeData.content[0].text as string
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Claude APIの応答からJSONを抽出できませんでした')
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0])

    const { data: updated, error: updateError } = await supabase
      .from('meetings')
      .update({
        transcript,
        kgi: analysis.kgi,
        kpi: analysis.kpi,
        pdca: analysis.pdca,
        tasks: analysis.tasks,
        status: 'done',
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    return Response.json(updated)
  } catch (err) {
    const message = err instanceof Error ? err.message : '不明なエラーが発生しました'
    await supabase
      .from('meetings')
      .update({ status: 'error', error_message: message })
      .eq('id', id)
    return Response.json({ error: message }, { status: 500 })
  }
}

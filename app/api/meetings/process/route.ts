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
  summary: string
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

  if (fetchError || !meeting || !meeting.transcript) {
    return Response.json({ error: 'meeting not found or transcript missing' }, { status: 404 })
  }

  try {
    const prompt = `以下は会議の文字起こしです。この内容を分析し、次のJSON形式のみを厳密に出力してください（説明文やコードブロックの記号は一切付けず、JSONのみを出力すること）。

{"summary": "会議全体の要約。後でメンバーが読んで内容を思い出せるよう、決定事項や話の流れを3〜5文程度で記述", "kgi": "最終目標(KGI)の説明", "kpi": "重要指標(KPI)の説明", "pdca": {"plan": "計画の内容", "do": "実行内容", "check": "評価内容", "act": "改善内容"}, "tasks": [{"title": "タスク名", "priority": "high または medium または low", "due_date": "YYYY-MM-DD形式、不明な場合は空文字", "assignee": "担当者・役割、不明な場合は空文字"}]}

文字起こし:
${meeting.transcript}`

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    )

    if (!geminiRes.ok) {
      throw new Error(`Gemini APIエラー: ${geminiRes.status}`)
    }

    const geminiData = await geminiRes.json()
    const responseText = geminiData.candidates[0].content.parts[0].text as string
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('Gemini APIの応答からJSONを抽出できませんでした')
    }

    const analysis: AnalysisResult = JSON.parse(jsonMatch[0])

    const PRIORITY_LABEL: Record<string, string> = { high: '高', medium: '中', low: '低' }

    const bodyParts: string[] = []
    if (analysis.summary) bodyParts.push(`📝 要約\n${analysis.summary}`)
    if (analysis.kgi) bodyParts.push(`🎯 KGI（最終目標）\n${analysis.kgi}`)
    if (analysis.kpi) bodyParts.push(`📊 KPI（重要指標）\n${analysis.kpi}`)

    const pdca = analysis.pdca
    if (pdca) {
      const pdcaLines: string[] = []
      if (pdca.plan) pdcaLines.push(`Plan: ${pdca.plan}`)
      if (pdca.do) pdcaLines.push(`Do: ${pdca.do}`)
      if (pdca.check) pdcaLines.push(`Check: ${pdca.check}`)
      if (pdca.act) pdcaLines.push(`Act: ${pdca.act}`)
      if (pdcaLines.length > 0) bodyParts.push(`🔄 PDCA\n${pdcaLines.join('\n')}`)
    }

    if (analysis.tasks.length > 0) {
      const taskLines = analysis.tasks.map(task => {
        const meta = [`優先度: ${PRIORITY_LABEL[task.priority] || task.priority}`]
        if (task.assignee) meta.push(`担当: ${task.assignee}`)
        if (task.due_date) meta.push(`納期: ${task.due_date}`)
        return `・${task.title}（${meta.join(' / ')}）`
      })
      bodyParts.push(`✅ タスクリスト\n${taskLines.join('\n')}`)
    }

    bodyParts.push('📋 文字起こしの確認は議事録ログ（📋）からご覧ください')

    const notes = bodyParts.join('\n\n')

    const { data: updated, error: updateError } = await supabase
      .from('meetings')
      .update({
        summary: analysis.summary,
        kgi: analysis.kgi,
        kpi: analysis.kpi,
        pdca: analysis.pdca,
        tasks: analysis.tasks,
        notes,
        status: 'done',
      })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      throw new Error(updateError.message)
    }

    const { data: post } = await supabase
      .from('posts')
      .insert({
        title: updated.title,
        body: notes,
        category: 'meeting',
        author_name: '議事録ログ',
        image_urls: [],
        likes_count: 0,
        meeting_id: id,
        user_id: meeting.user_id,
      })
      .select()
      .single()

    if (post) {
      await supabase.from('meetings').update({ post_id: post.id }).eq('id', id)
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

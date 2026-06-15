interface TaskReport {
  id: string
  task_title: string
  content: string | null
  photo_urls: string[] | null
  url: string | null
  insight: string | null
  improvement: string | null
  author_name: string | null
  created_at: string
}

export default function ActivityHistory({ reports }: { reports: TaskReport[] }) {
  if (reports.length === 0) {
    return <p className="text-sm text-[#9B9B9B]">まだ活動履歴がありません</p>
  }

  return (
    <div className="flex flex-col gap-3">
      {reports.map(report => (
        <div key={report.id} className="bg-white border border-[#F0F0F0] rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-[#1A1A1A] truncate">{report.task_title}</p>
            <p className="text-xs text-[#9B9B9B] whitespace-nowrap">{new Date(report.created_at).toLocaleString('ja-JP')}</p>
          </div>

          {report.author_name && <p className="text-xs text-[#9B9B9B]">{report.author_name}</p>}

          {report.content && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">やったこと</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.content}</p>
            </div>
          )}

          {report.photo_urls && report.photo_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {report.photo_urls.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt="" className="w-full h-20 object-cover rounded-lg border border-[#F0F0F0]" />
              ))}
            </div>
          )}

          {report.url && (
            <a href={report.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#E15252] underline break-all">
              {report.url}
            </a>
          )}

          {report.insight && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">気づき</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.insight}</p>
            </div>
          )}

          {report.improvement && (
            <div>
              <p className="text-xs font-bold text-[#E15252] mb-1 tracking-wider">次回改善点</p>
              <p className="text-sm text-[#1A1A1A] whitespace-pre-wrap">{report.improvement}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

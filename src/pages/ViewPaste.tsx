import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.css'
import { getPaste, rawUrl } from '../api/client'
import { ApiError, type Paste } from '../api/types'

export function ViewPaste() {
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  const [paste, setPaste] = useState<Paste | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'link' | 'content' | null>(null)

  useEffect(() => {
    if (!id) return
    getPaste(id)
      .then(setPaste)
      .catch((e) => {
        setError(e instanceof ApiError && e.status === 404
          ? 'This paste does not exist — it may have expired or been burned.'
          : e instanceof Error ? e.message : 'Something went wrong')
      })
  }, [id])

  const highlighted = useMemo(() => {
    if (!paste?.content) return null
    if (paste.syntax && paste.syntax !== 'text' && hljs.getLanguage(paste.syntax)) {
      return hljs.highlight(paste.content, { language: paste.syntax }).value
    }
    return null
  }, [paste])

  async function copy(what: 'link' | 'content') {
    await navigator.clipboard.writeText(what === 'link' ? paste!.url : paste!.content ?? '')
    setCopied(what)
    setTimeout(() => setCopied(null), 1500)
  }

  if (error) {
    return (
      <div className="notice error-page">
        <p>{error}</p>
        <Link to="/">new paste</Link>
      </div>
    )
  }
  if (!paste) return <div className="notice">loading…</div>

  return (
    <div className="view-paste">
      {state?.justCreated && (
        <div className="banner ok">
          created — share <a href={paste.url}>{paste.url}</a>
        </div>
      )}
      {paste.burned && (
        <div className="banner warn">
          this paste was burn-after-reading: it has now been deleted and
          cannot be viewed again
        </div>
      )}
      <div className="meta">
        <span className="mono">{paste.id}</span>
        <span>{paste.syntax}</span>
        <span>{paste.sizeBytes} bytes</span>
        <span>created {new Date(paste.createdAt).toLocaleString()}</span>
        {paste.expiresAt && <span>expires {new Date(paste.expiresAt).toLocaleString()}</span>}
        <span className="spacer" />
        <button onClick={() => copy('content')}>
          {copied === 'content' ? 'copied!' : 'copy'}
        </button>
        <button onClick={() => copy('link')}>
          {copied === 'link' ? 'copied!' : 'copy link'}
        </button>
        {!paste.burned && (
          <a className="button" href={rawUrl(paste.id)} target="_blank" rel="noreferrer">raw</a>
        )}
      </div>
      <pre className="paste-content">
        {highlighted
          ? <code dangerouslySetInnerHTML={{ __html: highlighted }} />
          : <code>{paste.content}</code>}
      </pre>
    </div>
  )
}

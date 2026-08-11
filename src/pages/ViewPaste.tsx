import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import hljs from 'highlight.js/lib/common'
import 'highlight.js/styles/github-dark.css'
import { getPaste, rawUrl } from '../api/client'
import { ApiError, type Paste } from '../api/types'
import { renderMarkdownWithDiagrams } from '../lib/markdown'
import { Mermaid } from '../components/Mermaid'

export function ViewPaste() {
  const { id } = useParams<{ id: string }>()
  const { state } = useLocation()
  // A just-created paste arrives via router state — using it (instead of
  // re-fetching) is what keeps burn-after-reading pastes alive until a
  // recipient actually opens the link.
  const [paste, setPaste] = useState<Paste | null>(state?.paste ?? null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'link' | 'content' | null>(null)
  const [showCreatedBanner, setShowCreatedBanner] = useState(Boolean(state?.justCreated))
  const [mdView, setMdView] = useState<'rendered' | 'source'>('rendered')

  const burnJustCreated = Boolean(state?.justCreated && paste?.burnAfterReading && !paste?.burned)

  useEffect(() => {
    if (!id || paste) return
    getPaste(id)
      .then(setPaste)
      .catch((e) => {
        setError(e instanceof ApiError && e.status === 404
          ? 'This paste does not exist — it may have expired or been burned.'
          : e instanceof Error ? e.message : 'Something went wrong')
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => {
    // The plain "share" banner fades; the burn warning must not.
    if (!showCreatedBanner || burnJustCreated) return
    const timer = setTimeout(() => setShowCreatedBanner(false), 6000)
    return () => clearTimeout(timer)
  }, [showCreatedBanner, burnJustCreated])

  const isMarkdown = paste?.syntax === 'markdown'
  const isMermaid = paste?.syntax === 'mermaid'
  const renderable = isMarkdown || isMermaid

  const highlighted = useMemo(() => {
    if (!paste?.content || renderable) return null
    if (paste.syntax && paste.syntax !== 'text' && hljs.getLanguage(paste.syntax)) {
      return hljs.highlight(paste.content, { language: paste.syntax }).value
    }
    return null
  }, [paste, renderable])

  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    if (paste?.content && isMarkdown && mdView === 'rendered') {
      renderMarkdownWithDiagrams(paste.content).then((h) => alive && setMarkdownHtml(h))
    } else {
      setMarkdownHtml(null)
    }
    return () => {
      alive = false
    }
  }, [paste, isMarkdown, mdView])

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
      {burnJustCreated ? (
        <div className="banner warn">
          burn-after-reading — share <a href={paste.url}>{paste.url}</a> without
          opening it yourself: the first visit destroys this paste. Leaving or
          refreshing this page is safe; opening the link is not.
        </div>
      ) : (
        showCreatedBanner && (
          <div className="banner ok">
            share <a href={paste.url}>{paste.url}</a>
          </div>
        )
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
        {renderable && (
          <button onClick={() => setMdView(mdView === 'rendered' ? 'source' : 'rendered')}>
            {mdView === 'rendered' ? 'view source' : 'view rendered'}
          </button>
        )}
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
      {isMermaid && mdView === 'rendered' ? (
        <div className="paste-content">
          <Mermaid code={paste.content ?? ''} />
        </div>
      ) : markdownHtml ? (
        <div className="paste-content md-body" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
      ) : isMarkdown && mdView === 'rendered' ? (
        <div className="notice">rendering…</div>
      ) : (
        <pre className="paste-content">
          {highlighted
            ? <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            : <code>{paste.content}</code>}
        </pre>
      )}
    </div>
  )
}

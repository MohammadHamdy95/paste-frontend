import { useEffect, useState } from 'react'
import { renderMermaid } from '../lib/mermaid'

/** Renders a whole paste as a mermaid diagram, with graceful failure. */
export function Mermaid({ code }: { code: string }) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    setSvg(null)
    setError(null)
    renderMermaid(code)
      .then((s) => alive && setSvg(s))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'invalid diagram'))
    return () => {
      alive = false
    }
  }, [code])

  if (error) {
    return (
      <div className="mermaid-error">
        <p>could not render diagram: {error}</p>
        <pre>{code}</pre>
      </div>
    )
  }
  if (!svg) return <div className="notice">rendering diagram…</div>
  return <div className="mermaid-diagram" dangerouslySetInnerHTML={{ __html: svg }} />
}

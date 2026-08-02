import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createPaste } from '../api/client'

const SYNTAXES = [
  'text', 'bash', 'c', 'cpp', 'css', 'go', 'html', 'java', 'javascript',
  'json', 'kotlin', 'markdown', 'python', 'rust', 'sql', 'typescript', 'yaml',
]

const EXPIRIES: Array<{ label: string; seconds: number | null }> = [
  { label: 'never', seconds: null },
  { label: '1 hour', seconds: 3600 },
  { label: '1 day', seconds: 86_400 },
  { label: '1 week', seconds: 604_800 },
  { label: '1 month', seconds: 2_592_000 },
  { label: '1 year', seconds: 31_536_000 },
]

export function NewPaste() {
  const navigate = useNavigate()
  const [content, setContent] = useState('')
  const [syntax, setSyntax] = useState('text')
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [burn, setBurn] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit() {
    if (!content.trim()) return
    setBusy(true)
    setError(null)
    try {
      const paste = await createPaste({
        content,
        syntax,
        expiresIn,
        burnAfterReading: burn,
      })
      navigate(`/${paste.id}`, { state: { justCreated: true } })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="new-paste">
      <textarea
        className="paste-input"
        placeholder="Paste your text or code here…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        spellCheck={false}
        autoFocus
      />
      <div className="toolbar">
        <label>
          syntax
          <select value={syntax} onChange={(e) => setSyntax(e.target.value)}>
            {SYNTAXES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </label>
        <label>
          expires
          <select
            value={expiresIn ?? ''}
            onChange={(e) => setExpiresIn(e.target.value === '' ? null : Number(e.target.value))}
          >
            {EXPIRIES.map(({ label, seconds }) => (
              <option key={label} value={seconds ?? ''}>{label}</option>
            ))}
          </select>
        </label>
        <label className="checkbox">
          <input type="checkbox" checked={burn} onChange={(e) => setBurn(e.target.checked)} />
          burn after reading
        </label>
        <span className="spacer" />
        <button onClick={submit} disabled={busy || !content.trim()}>
          {busy ? 'creating…' : 'create paste'}
        </button>
      </div>
      {error && <p className="error">{error}</p>}
    </div>
  )
}

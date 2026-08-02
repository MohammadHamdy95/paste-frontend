import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deletePaste, getAdminToken, listPastes } from '../api/client'
import { ApiError, type Paste } from '../api/types'
import { TokenPrompt } from '../components/TokenPrompt'

export function MyPastes() {
  const [items, setItems] = useState<Paste[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hasToken, setHasToken] = useState(() => getAdminToken() !== '')

  async function load(after?: string | null) {
    try {
      const page = await listPastes(after)
      setItems((current) => (after ? [...current, ...page.items] : page.items))
      setCursor(page.nextCursor)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) setHasToken(false)
      else setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  useEffect(() => {
    if (hasToken) void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken])

  async function remove(id: string) {
    await deletePaste(id)
    setItems((current) => current.filter((p) => p.id !== id))
  }

  if (!hasToken) {
    return <TokenPrompt onSaved={() => setHasToken(true)} />
  }
  if (error) return <div className="notice error-page">{error}</div>

  return (
    <div className="my-pastes">
      {items.length === 0 && <div className="notice">no pastes yet</div>}
      {items.map((paste) => (
        <div className="paste-row" key={paste.id}>
          <Link className="mono" to={`/${paste.id}`}>{paste.id}</Link>
          <span>{paste.syntax}</span>
          <span>{paste.sizeBytes} b</span>
          <span>{new Date(paste.createdAt).toLocaleString()}</span>
          {paste.burnAfterReading && <span className="tag">burn</span>}
          <span className="spacer" />
          <button onClick={() => remove(paste.id)}>delete</button>
        </div>
      ))}
      {cursor && <button className="load-more" onClick={() => load(cursor)}>load more</button>}
    </div>
  )
}

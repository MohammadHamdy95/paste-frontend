import { useState } from 'react'
import { setAdminToken } from '../api/client'

/**
 * Creating/listing needs the admin token (this is a single-user app);
 * it lives in localStorage only. Viewing pastes never needs it.
 */
export function TokenPrompt({ onSaved }: { onSaved: () => void }) {
  const [value, setValue] = useState('')

  return (
    <div className="token-prompt">
      <p>This action needs the admin token.</p>
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!value.trim()) return
          setAdminToken(value.trim())
          onSaved()
        }}
      >
        <input
          type="password"
          placeholder="admin token"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
        />
        <button type="submit" disabled={!value.trim()}>save</button>
      </form>
    </div>
  )
}

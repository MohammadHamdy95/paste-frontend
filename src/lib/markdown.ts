import { marked } from 'marked'
import DOMPurify from 'dompurify'

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ```mermaid fences become placeholder blocks that renderMermaidBlocks()
// swaps for SVG after the sanitized HTML is in the DOM.
marked.use({
  renderer: {
    code({ text, lang }) {
      if ((lang ?? '').trim() === 'mermaid') {
        return `<pre data-mermaid>${escapeHtml(text)}</pre>`
      }
      return false
    },
  },
})

// Synchronous parse (no async extensions in use), then sanitize —
// paste content is untrusted user input.
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false, gfm: true, breaks: false })
  return DOMPurify.sanitize(html, { ADD_ATTR: ['data-mermaid'] })
}

/**
 * Markdown → HTML with ```mermaid fences already rendered to SVG.
 * Producing the final string BEFORE injection keeps React's
 * dangerouslySetInnerHTML idempotent (StrictMode remounts re-apply it,
 * which would wipe any post-injection DOM mutation).
 */
export async function renderMarkdownWithDiagrams(source: string): Promise<string> {
  const html = renderMarkdown(source)
  if (!html.includes('data-mermaid')) return html
  const { renderMermaidBlocks } = await import('./mermaid')
  const scratch = document.createElement('div')
  scratch.innerHTML = html
  await renderMermaidBlocks(scratch)
  return scratch.innerHTML
}

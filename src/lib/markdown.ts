import { marked } from 'marked'
import DOMPurify from 'dompurify'

// Synchronous parse (no async extensions in use), then sanitize —
// paste content is untrusted user input.
export function renderMarkdown(source: string): string {
  const html = marked.parse(source, { async: false, gfm: true, breaks: false })
  return DOMPurify.sanitize(html)
}

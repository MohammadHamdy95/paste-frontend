// Mermaid is ~1.5 MB minified, so it loads only when a diagram is
// actually on screen (dynamic import → separate Vite chunk).
let mermaidPromise: Promise<typeof import('mermaid')['default']> | null = null

function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import('mermaid').then((m) => {
      // strict: mermaid sanitizes labels/clicks — paste content is untrusted
      m.default.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'dark' })
      return m.default
    })
  }
  return mermaidPromise
}

let seq = 0

export async function renderMermaid(code: string): Promise<string> {
  const mermaid = await loadMermaid()
  const id = `mmd-${++seq}`
  try {
    const { svg } = await mermaid.render(id, code)
    return svg
  } finally {
    // mermaid leaves a scratch element behind on parse errors
    document.getElementById(`d${id}`)?.remove()
  }
}

/** Replace `pre[data-mermaid]` blocks (from markdown fences) with rendered SVG. */
export async function renderMermaidBlocks(container: HTMLElement) {
  const nodes = Array.from(container.querySelectorAll('pre[data-mermaid]'))
  for (const node of nodes) {
    try {
      const svg = await renderMermaid(node.textContent ?? '')
      const div = document.createElement('div')
      div.className = 'mermaid-diagram'
      div.innerHTML = svg
      node.replaceWith(div)
    } catch {
      node.classList.add('mermaid-failed') // leave the source visible
    }
  }
}

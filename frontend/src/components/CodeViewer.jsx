import { useEffect, useRef, useState } from 'react'
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import css from 'highlight.js/lib/languages/css'
import xml from 'highlight.js/lib/languages/xml'
import json from 'highlight.js/lib/languages/json'
import markdown from 'highlight.js/lib/languages/markdown'
import 'highlight.js/styles/github-dark-dimmed.css'
import { FileCode2, X } from 'lucide-react'

hljs.registerLanguage('javascript', javascript)
hljs.registerLanguage('jsx', javascript)
hljs.registerLanguage('css', css)
hljs.registerLanguage('html', xml)
hljs.registerLanguage('xml', xml)
hljs.registerLanguage('json', json)
hljs.registerLanguage('markdown', markdown)

function getLanguage(filename) {
  const ext = filename.split('.').pop().toLowerCase()
  const map = {
    js: 'javascript', jsx: 'javascript', ts: 'javascript', tsx: 'javascript',
    css: 'css', html: 'html', xml: 'xml', json: 'json', md: 'markdown',
  }
  return map[ext] || 'plaintext'
}

export default function CodeViewer({ filePath, agentUrl, onClose }) {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const codeRef = useRef(null)

  useEffect(() => {
    if (!filePath || !agentUrl) return
    const fetchFile = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${agentUrl}/read-files?files=${filePath}`)
        if (!res.ok) throw new Error('Failed to read file')
        const data = await res.json()
        const fileContent = data.files?.[0]?.[filePath] || ''
        setContent(fileContent)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchFile()
  }, [filePath, agentUrl])

  useEffect(() => {
    if (codeRef.current && content) {
      hljs.highlightElement(codeRef.current)
    }
  }, [content])

  if (!filePath) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-1/30">
        <div className="text-center space-y-3">
          <FileCode2 className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500">Select a file to view its contents</p>
        </div>
      </div>
    )
  }

  const fileName = filePath.split('/').pop()
  const language = getLanguage(fileName)

  return (
    <div className="h-full flex flex-col bg-surface-1/30">
      {/* Tab */}
      <div className="flex items-center border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2 px-4 py-2 border-b-2 border-purple-500 bg-white/[0.02] text-sm">
          <FileCode2 className="w-3.5 h-3.5 text-purple-400" />
          <span className="text-gray-200">{fileName}</span>
          <button
            onClick={onClose}
            className="ml-2 p-0.5 rounded hover:bg-white/10 text-gray-500 hover:text-gray-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex-1" />
        <span className="pr-4 text-xs text-gray-600 font-mono">{filePath}</span>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="p-4 text-red-400 text-sm">{error}</div>
        ) : (
          <div className="relative">
            {/* Line numbers + code */}
            <div className="flex text-sm font-mono">
              <div className="select-none text-right pr-4 pl-4 py-3 text-gray-600 border-r border-white/5 bg-white/[0.01] leading-6">
                {content.split('\n').map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>
              <pre className="flex-1 p-3 m-0 overflow-x-auto leading-6">
                <code ref={codeRef} className={`language-${language}`}>
                  {content}
                </code>
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

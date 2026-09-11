import { useState, useRef, useEffect } from 'react'
import Markdown from 'react-markdown'
import {
  Send,
  Sparkles,
  User,
  Bot,
  Loader2,
  FileCode2,
  FolderSearch,
  FileEdit,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'

// Parse SSE action messages into structured status
function parseAction(text) {
  if (text.startsWith('Listing files')) return { icon: FolderSearch, label: text, color: 'text-blue-400' }
  if (text.startsWith('Reading files')) return { icon: FileCode2, label: text, color: 'text-cyan-400' }
  if (text.startsWith('Updating files')) return { icon: FileEdit, label: text, color: 'text-amber-400' }
  if (text.startsWith('Files updated')) return { icon: CheckCircle2, label: text, color: 'text-green-400' }
  if (text.startsWith('Files read')) return { icon: CheckCircle2, label: text, color: 'text-green-400' }
  if (text.startsWith('Files listed')) return { icon: CheckCircle2, label: text, color: 'text-green-400' }
  return { icon: Bot, label: text, color: 'text-gray-400' }
}

export default function ChatPanel({ sandboxId, onFilesUpdated }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || streaming) return

    // Add user message
    const userMsg = { role: 'user', content: text, id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setStreaming(true)

    // Add AI placeholder
    const aiMsgId = Date.now() + 1
    const aiMsg = { role: 'ai', content: '', actions: [], id: aiMsgId, streaming: true }
    setMessages((prev) => [...prev, aiMsg])

    try {
      const res = await fetch('/api/ai/agent/invoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, projectId: sandboxId }),
      })

      if (!res.ok) throw new Error('Failed to invoke AI agent')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed) continue

          // Try to parse SSE data
          let actionText = trimmed
          if (trimmed.startsWith('data:')) {
            actionText = trimmed.slice(5).trim()
          }

          if (actionText) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === aiMsgId
                  ? { ...m, actions: [...m.actions, actionText] }
                  : m
              )
            )

            // Trigger file refresh when files are updated
            if (actionText.includes('Files updated successfully')) {
              onFilesUpdated?.()
            }
          }
        }
      }

      // Mark streaming as done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId ? { ...m, streaming: false } : m
        )
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMsgId
            ? { ...m, streaming: false, error: err.message, actions: [...m.actions, `Error: ${err.message}`] }
            : m
        )
      )
    } finally {
      setStreaming(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface-1/30">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-gray-200">AI Assistant</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-60">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/10 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-300 font-medium">How can I help?</p>
              <p className="text-xs text-gray-500 mt-1">Describe what you want to build</p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-xs">
              {['Create a landing page', 'Build a todo app', 'Add a navbar'].map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="px-3 py-1.5 text-xs rounded-lg border border-white/10 bg-white/[0.03] text-gray-400 hover:text-gray-200 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? '' : ''}`}>
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
              msg.role === 'user'
                ? 'bg-blue-500/20 text-blue-400'
                : 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 text-purple-400'
            }`}>
              {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-500 mb-1">
                {msg.role === 'user' ? 'You' : 'Codeora AI'}
              </p>

              {msg.role === 'user' ? (
                <div className="text-sm text-gray-200 leading-relaxed chat-markdown">
                  <Markdown>{msg.content}</Markdown>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {msg.actions.map((action, i) => {
                    const parsed = parseAction(action)
                    const ActionIcon = parsed.icon
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-xs py-1 px-2.5 rounded-lg bg-white/[0.02] border border-white/5"
                      >
                        <ActionIcon className={`w-3.5 h-3.5 shrink-0 ${parsed.color}`} />
                        <span className="text-gray-300 truncate">{parsed.label}</span>
                      </div>
                    )
                  })}

                  {msg.streaming && (
                    <div className="flex items-center gap-1.5 py-2 px-2.5">
                      <div className="flex gap-1">
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span className="typing-dot w-1.5 h-1.5 rounded-full bg-purple-400" />
                      </div>
                      <span className="text-xs text-gray-500">Processing...</span>
                    </div>
                  )}

                  {msg.error && (
                    <div className="flex items-center gap-2 text-xs py-1.5 px-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      {msg.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-end gap-2 p-2 rounded-xl border border-white/10 bg-white/[0.03] focus-within:border-purple-500/40 transition-colors">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Describe what you want to build..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none outline-none px-2 py-1.5 max-h-32"
            style={{ minHeight: '36px' }}
            onInput={(e) => {
              e.target.style.height = 'auto'
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px'
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || streaming}
            className="p-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white
              hover:from-purple-500 hover:to-blue-500 transition-all
              disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
          >
            {streaming ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}

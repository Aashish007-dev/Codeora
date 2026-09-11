import { useEffect, useRef } from 'react'
import { Terminal } from '@xterm/xterm'
import { FitAddon } from '@xterm/addon-fit'
import { io } from 'socket.io-client'
import '@xterm/xterm/css/xterm.css'
import { TerminalSquare } from 'lucide-react'

export default function TerminalPanel({ sandboxId }) {
  const containerRef = useRef(null)
  const termRef = useRef(null)
  const socketRef = useRef(null)
  const fitAddonRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !sandboxId) return

    // Create terminal
    const term = new Terminal({
      cursorBlink: true,
      cursorStyle: 'bar',
      fontSize: 13,
      fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
      lineHeight: 1.4,
      theme: {
        background: '#0a0a0f',
        foreground: '#e2e8f0',
        cursor: '#7c3aed',
        cursorAccent: '#0a0a0f',
        selectionBackground: 'rgba(124, 58, 237, 0.3)',
        selectionForeground: '#ffffff',
        black: '#1e1e2e',
        red: '#f38ba8',
        green: '#a6e3a1',
        yellow: '#f9e2af',
        blue: '#89b4fa',
        magenta: '#cba6f7',
        cyan: '#94e2d5',
        white: '#cdd6f4',
        brightBlack: '#585b70',
        brightRed: '#f38ba8',
        brightGreen: '#a6e3a1',
        brightYellow: '#f9e2af',
        brightBlue: '#89b4fa',
        brightMagenta: '#cba6f7',
        brightCyan: '#94e2d5',
        brightWhite: '#a6adc8',
      },
    })

    const fitAddon = new FitAddon()
    term.loadAddon(fitAddon)
    term.open(containerRef.current)

    // Small delay to ensure container is sized
    setTimeout(() => {
      fitAddon.fit()
    }, 100)

    termRef.current = term
    fitAddonRef.current = fitAddon

    // Connect Socket.IO directly to the agent subdomain.
    // In agent-container, Socket.IO has CORS enabled (origin: '*') and supports polling + websocket.
    const agentOrigin = window.location.protocol === 'https:' 
      ? `https://${sandboxId}.agent.localhost` 
      : `http://${sandboxId}.agent.localhost`
    const socket = io(agentOrigin, {
      transports: ['polling', 'websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })
    socketRef.current = socket

    socket.on('connect', () => {
      term.writeln('\x1b[1;35m● Connected to sandbox terminal\x1b[0m')
      term.writeln('')
    })

    socket.on('terminal-output', (data) => {
      term.write(data)
    })

    socket.on('disconnect', () => {
      term.writeln('')
      term.writeln('\x1b[1;31m● Disconnected from terminal\x1b[0m')
    })

    socket.on('connect_error', (err) => {
      term.writeln(`\x1b[1;31m● Connection error — retrying...\x1b[0m`)
    })

    // Send input
    term.onData((data) => {
      socket.emit('terminal-input', data)
    })

    // Resize handler
    const observer = new ResizeObserver(() => {
      try {
        fitAddon.fit()
      } catch {
        // Ignore resize errors when element is hidden
      }
    })
    observer.observe(containerRef.current)

    return () => {
      observer.disconnect()
      socket.disconnect()
      term.dispose()
    }
  }, [sandboxId])

  if (!sandboxId) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-0">
        <div className="text-center space-y-2">
          <TerminalSquare className="w-8 h-8 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500">Terminal not available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 bg-white/[0.02]">
        <TerminalSquare className="w-3.5 h-3.5 text-green-400" />
        <span className="text-xs font-medium text-gray-400">Terminal</span>
        <div className="ml-auto flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] text-gray-500">Connected</span>
        </div>
      </div>

      {/* Terminal container */}
      <div ref={containerRef} className="flex-1 overflow-hidden" />
    </div>
  )
}

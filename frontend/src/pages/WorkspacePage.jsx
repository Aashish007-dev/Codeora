import { useState, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import {
  Sparkles,
  PanelLeft,
  MessageSquare,
  Code2,
  ArrowLeft,
  Copy,
  Check,
} from 'lucide-react'
import FileExplorer from '../components/FileExplorer'
import CodeViewer from '../components/CodeViewer'
import ChatPanel from '../components/ChatPanel'
import PreviewPanel from '../components/PreviewPanel'
import TerminalPanel from '../components/TerminalPanel'

export default function WorkspacePage() {
  const { sandboxId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()

  const previewUrl = location.state?.previewUrl || `http://${sandboxId}.preview.localhost`
  const agentUrl = `/api/agent/${sandboxId}`

  const [showSidebar, setShowSidebar] = useState(true)
  const [activeTab, setActiveTab] = useState('chat') // 'chat' | 'code'
  const [selectedFile, setSelectedFile] = useState(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [copied, setCopied] = useState(false)

  const handleFilesUpdated = useCallback(() => {
    setRefreshTrigger((c) => c + 1)
  }, [])

  const handleFileSelect = (filePath) => {
    setSelectedFile(filePath)
    setActiveTab('code')
  }

  const handleCopyId = () => {
    navigator.clipboard.writeText(sandboxId)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-screen flex flex-col bg-surface-0 overflow-hidden">
      {/* ─── Top Bar ─── */}
      <header className="flex items-center gap-3 px-3 py-2 border-b border-white/5 bg-white/[0.01] shrink-0">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors group"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-colors" />
          <div className="w-7 h-7 rounded-md bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-md shadow-purple-500/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-200 tracking-tight">Codeora</span>
        </button>

        {/* Separator */}
        <div className="h-5 w-px bg-white/10" />

        {/* Sandbox ID */}
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/5 hover:border-purple-500/20 transition-colors group"
        >
          <span className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{sandboxId}</span>
          {copied ? (
            <Check className="w-3 h-3 text-green-400 shrink-0" />
          ) : (
            <Copy className="w-3 h-3 text-gray-600 group-hover:text-gray-400 shrink-0" />
          )}
        </button>

        <div className="flex-1" />

        {/* Toggle sidebar */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className={`p-1.5 rounded-lg transition-colors ${
            showSidebar ? 'bg-purple-500/15 text-purple-400' : 'text-gray-500 hover:bg-white/5'
          }`}
          title="Toggle explorer"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      </header>

      {/* ─── Main Layout ─── */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Explorer Sidebar */}
        {showSidebar && (
          <div className="w-60 shrink-0 border-r border-white/5 overflow-hidden">
            <FileExplorer
              agentUrl={agentUrl}
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              refreshTrigger={refreshTrigger}
            />
          </div>
        )}

        {/* Left Panel: Chat / Code */}
        <div className="w-[420px] shrink-0 border-r border-white/5 flex flex-col overflow-hidden">
          {/* Tab switcher */}
          <div className="flex border-b border-white/5 bg-white/[0.01] shrink-0">
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'chat'
                  ? 'border-purple-500 text-purple-300 bg-purple-500/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Chat
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors border-b-2 ${
                activeTab === 'code'
                  ? 'border-purple-500 text-purple-300 bg-purple-500/5'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Code
            </button>
          </div>

          {/* Panel content */}
          <div className="flex-1 overflow-hidden">
            <div className={activeTab === 'chat' ? 'h-full' : 'hidden'}>
              <ChatPanel
                sandboxId={sandboxId}
                onFilesUpdated={handleFilesUpdated}
              />
            </div>
            <div className={activeTab === 'code' ? 'h-full' : 'hidden'}>
              <CodeViewer
                filePath={selectedFile}
                agentUrl={agentUrl}
                onClose={() => {
                  setSelectedFile(null)
                  setActiveTab('chat')
                }}
              />
            </div>
          </div>
        </div>

        {/* Right Panel: Preview + Terminal */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Preview */}
          <div className="flex-1 overflow-hidden">
            <PreviewPanel previewUrl={previewUrl} />
          </div>

          {/* Terminal */}
          <div className="h-64 shrink-0 border-t border-white/5 overflow-hidden">
            <TerminalPanel sandboxId={sandboxId} />
          </div>
        </div>
      </div>
    </div>
  )
}

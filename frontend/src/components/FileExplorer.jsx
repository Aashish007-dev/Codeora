import { useState, useEffect, useCallback } from 'react'
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FileJson,
  FileCode2,
  Image,
  FolderOpen,
  Folder,
  RefreshCw,
} from 'lucide-react'

// Map file extensions to icons & colors
function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase()
  const map = {
    jsx: { icon: FileCode2, color: 'text-blue-400' },
    js: { icon: FileCode2, color: 'text-yellow-400' },
    ts: { icon: FileCode2, color: 'text-blue-500' },
    tsx: { icon: FileCode2, color: 'text-blue-400' },
    css: { icon: FileText, color: 'text-pink-400' },
    html: { icon: FileCode2, color: 'text-orange-400' },
    json: { icon: FileJson, color: 'text-yellow-500' },
    md: { icon: FileText, color: 'text-gray-400' },
    svg: { icon: Image, color: 'text-green-400' },
    png: { icon: Image, color: 'text-green-400' },
    jpg: { icon: Image, color: 'text-green-400' },
  }
  return map[ext] || { icon: FileText, color: 'text-gray-500' }
}

// Build a tree structure from flat file list
function buildTree(files) {
  const root = { name: '', children: {}, isDir: true }
  files.forEach((filePath) => {
    const parts = filePath.split('/')
    let current = root
    parts.forEach((part, idx) => {
      if (!current.children[part]) {
        current.children[part] = {
          name: part,
          path: parts.slice(0, idx + 1).join('/'),
          children: {},
          isDir: idx < parts.length - 1,
        }
      }
      if (idx < parts.length - 1) {
        current.children[part].isDir = true
      }
      current = current.children[part]
    })
  })
  return root
}

function TreeNode({ node, depth = 0, selectedFile, onFileSelect }) {
  const [expanded, setExpanded] = useState(depth < 2)
  const children = Object.values(node.children).sort((a, b) => {
    if (a.isDir && !b.isDir) return -1
    if (!a.isDir && b.isDir) return 1
    return a.name.localeCompare(b.name)
  })

  if (node.isDir) {
    return (
      <div>
        {node.name && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center gap-1.5 px-2 py-1 text-sm text-gray-300 hover:bg-white/5 rounded-md transition-colors group"
            style={{ paddingLeft: depth * 12 + 8 }}
          >
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-500 shrink-0" />
            )}
            {expanded ? (
              <FolderOpen className="w-4 h-4 text-purple-400 shrink-0" />
            ) : (
              <Folder className="w-4 h-4 text-purple-400/60 shrink-0" />
            )}
            <span className="truncate">{node.name}</span>
          </button>
        )}
        {expanded && children.map((child) => (
          <TreeNode
            key={child.path}
            node={child}
            depth={node.name ? depth + 1 : depth}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        ))}
      </div>
    )
  }

  const { icon: Icon, color } = getFileIcon(node.name)
  const isSelected = selectedFile === `/${node.path}`

  return (
    <button
      onClick={() => onFileSelect(`/${node.path}`)}
      className={`w-full flex items-center gap-1.5 px-2 py-1 text-sm rounded-md transition-colors ${
        isSelected
          ? 'bg-purple-500/15 text-purple-300'
          : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
      style={{ paddingLeft: depth * 12 + 24 }}
    >
      <Icon className={`w-4 h-4 shrink-0 ${color}`} />
      <span className="truncate">{node.name}</span>
    </button>
  )
}

export default function FileExplorer({ agentUrl, selectedFile, onFileSelect, refreshTrigger }) {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(async () => {
    if (!agentUrl) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${agentUrl}/list-files`)
      if (!res.ok) throw new Error('Failed to list files')
      const data = await res.json()
      setFiles(data.files || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [agentUrl])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles, refreshTrigger])

  const tree = buildTree(files)

  return (
    <div className="h-full flex flex-col bg-surface-1/50">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Explorer
        </span>
        <button
          onClick={fetchFiles}
          className="p-1 rounded-md hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
          title="Refresh files"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* File Tree */}
      <div className="flex-1 overflow-y-auto py-1.5">
        {loading && files.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-5 h-5 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="px-3 py-4 text-xs text-red-400 text-center">{error}</div>
        ) : (
          <TreeNode
            node={tree}
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        )}
      </div>
    </div>
  )
}

import { useState, useRef } from 'react'
import {
  RefreshCw,
  ExternalLink,
  Monitor,
  Tablet,
  Smartphone,
  Globe,
} from 'lucide-react'

const SIZES = [
  { icon: Monitor, label: 'Desktop', width: '100%' },
  { icon: Tablet, label: 'Tablet', width: '768px' },
  { icon: Smartphone, label: 'Mobile', width: '375px' },
]

export default function PreviewPanel({ previewUrl }) {
  const iframeRef = useRef(null)
  const [sizeIndex, setSizeIndex] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const openExternal = () => {
    window.open(previewUrl, '_blank')
  }

  if (!previewUrl) {
    return (
      <div className="h-full flex items-center justify-center bg-surface-1/30">
        <div className="text-center space-y-3">
          <Globe className="w-10 h-10 text-gray-600 mx-auto" />
          <p className="text-sm text-gray-500">Preview will appear here</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-surface-0">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/[0.02]">
        {/* URL Bar */}
        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/5">
          <Globe className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className="text-xs text-gray-400 font-mono truncate">{previewUrl}</span>
        </div>

        {/* Responsive Sizes */}
        <div className="flex items-center rounded-lg border border-white/5 bg-white/[0.02] overflow-hidden">
          {SIZES.map((s, i) => (
            <button
              key={s.label}
              onClick={() => setSizeIndex(i)}
              className={`p-1.5 transition-colors ${
                sizeIndex === i
                  ? 'bg-purple-500/15 text-purple-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
              }`}
              title={s.label}
            >
              <s.icon className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          title="Refresh preview"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>

        {/* External */}
        <button
          onClick={openExternal}
          className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-colors"
          title="Open in new tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Iframe */}
      <div className="flex-1 flex flex-col items-center justify-start bg-[#0d0d14] overflow-hidden p-2">
        <div
          className="w-full h-full bg-white rounded-lg overflow-hidden transition-all duration-300 shadow-2xl shadow-black/50 flex flex-col"
          style={{ width: SIZES[sizeIndex].width, maxWidth: '100%' }}
        >
          <iframe
            ref={iframeRef}
            key={refreshKey}
            src={previewUrl}
            title="Preview"
            className="w-full h-full border-0 flex-1"
          />
        </div>
      </div>
    </div>
  )
}

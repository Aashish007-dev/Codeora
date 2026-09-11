import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    hmr: {
      clientPort: 5173,
    },
    proxy: {
      // REST API — forwarded to the backend/ingress
      "/api": {
        target: "http://127.0.0.1:80",
        changeOrigin: true,
        secure: false,
        timeout: 300000,
        proxyTimeout: 300000,
        configure: (proxy) => {
          proxy.on('error', (err) => console.log('proxy error', err))
          proxy.on('proxyReq', (proxyReq, req) => {
            // Dynamically route /api/agent/{sandboxId}/... to {sandboxId}.agent.localhost
            const agentMatch = req.url?.match(/^\/api\/agent\/([^/]+)(\/.*)$/)
            if (agentMatch) {
              const [, sandboxId, rest] = agentMatch
              proxyReq.setHeader('host', `${sandboxId}.agent.localhost`)
              proxyReq.path = rest  // strip /api/agent/{sandboxId} prefix
            }
            console.log('proxying:', req.method, req.url, '→', proxyReq.path)
          })
          proxy.on('proxyRes', (res, req) => console.log('got response:', res.statusCode, req.url))
        }
      },
      // Socket.IO WebSocket for terminal
      "/ws/agent": {
        target: "http://127.0.0.1:80",
        changeOrigin: true,
        ws: true,
        secure: false,
        configure: (proxy) => {
          const handleUpgrade = (proxyReq, req) => {
            const match = req.url?.match(/^\/ws\/agent\/([^/]+)(\/.*)?$/)
            if (match) {
              const [, sandboxId, rest] = match
              proxyReq.setHeader('host', `${sandboxId}.agent.localhost`)
              proxyReq.path = (rest || '/socket.io/').replace(/^\/ws\/agent\/[^/]+/, '')
              console.log('ws proxying:', req.url, '→', proxyReq.path)
            }
          }
          proxy.on('error', (err) => console.log('ws proxy error', err.message))
          proxy.on('proxyReq', handleUpgrade)
          proxy.on('proxyReqWs', handleUpgrade)
        }
      }
    }
  }
})

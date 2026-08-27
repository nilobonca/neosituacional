import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const supabaseUrl = env.SUPABASE_URL || ''
  const supabaseKey = env.SUPABASE_ANON_KEY || ''

  if (!supabaseUrl && mode === 'development') {
    console.warn('\x1b[33m⚠ SUPABASE_URL not found in .env — dev proxy will not work.\x1b[0m')
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/api/supabase': {
          target: supabaseUrl,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/supabase/, ''),
          headers: {
            apikey: supabaseKey,
          },
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              const auth = req.headers['authorization']
              if (!auth || auth === 'Bearer proxy-client-key') {
                proxyReq.setHeader('authorization', `Bearer ${supabaseKey}`)
              }
              proxyReq.setHeader('apikey', supabaseKey)
            })
          },
        },
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})

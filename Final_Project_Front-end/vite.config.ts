import { defineConfig, loadEnv } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]
const autoBase =
  process.env.GITHUB_ACTIONS === 'true' && repoName ? `/${repoName}/` : '/'
const base = process.env.VITE_BASE_PATH || autoBase

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:4100'

  return {
    base,
    plugins: [tailwindcss()],
    server: {
      port: parseInt(process.env.PORT || '5173', 10),
      proxy: {
        '/api': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

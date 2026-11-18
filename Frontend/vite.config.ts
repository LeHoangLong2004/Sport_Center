import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load file .env từ cả __dirname (thư mục Frontend) lẫn process.cwd() để không bao giờ bị hụt file .env
  const env = {
    ...loadEnv(mode, process.cwd(), ''),
    ...loadEnv(mode, __dirname, ''),
  }

  // Mặc định chạy Localhost (http://localhost:5000) trừ khi cấu hình rõ ràng VITE_USE_LOCAL=false
  const isDeploy = env.VITE_USE_LOCAL === 'false'
  const activeApiUrl = isDeploy
    ? (env.VITE_DEPLOY_API_URL || 'https://sport-center-ga9j.onrender.com')
    : (env.VITE_LOCAL_API_URL || 'http://localhost:5000')

  console.log(`\n===============================================================`)
  console.log(`>>> [Vite API Proxy] ĐANG TRỎ VỀ: ${activeApiUrl}`)
  console.log(`>>> [Chế độ] ${isDeploy ? 'CHẠY CLOUD DEPLOY (Render online)' : 'CHẠY LOCALHOST (Cần bật backend C#)'}`)
  console.log(`===============================================================\n`)

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target: activeApiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: activeApiUrl,
          changeOrigin: true,
          secure: false,
        },
        '/swagger': {
          target: activeApiUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

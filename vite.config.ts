import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const disableMsw =
    env.VITE_DISABLE_MSW === 'true' || process.env.VITE_DISABLE_MSW === 'true'

  return {
    plugins: [react()],
    resolve: {
      alias: disableMsw
        ? [
            {
              find: '@/lib/mswBootstrap',
              replacement: path.resolve(__dirname, './src/lib/mswBootstrap.stub.ts'),
            },
            {
              find: '@/mocks/browser',
              replacement: path.resolve(__dirname, './src/mocks/browser.stub.ts'),
            },
            {
              find: '@/components/layout/DevToolbar',
              replacement: path.resolve(__dirname, './src/components/layout/DevToolbar.stub.tsx'),
            },
            { find: '@', replacement: path.resolve(__dirname, './src') },
          ]
        : [{ find: '@', replacement: path.resolve(__dirname, './src') }],
    },
    build: {
      modulePreload: disableMsw ? false : undefined,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts') || id.includes('d3-')) return 'vendor-charts'
            if (id.includes('msw')) return 'vendor-msw'
            if (id.includes('@radix-ui')) return 'vendor-radix'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('@tanstack/react-query')) return 'vendor-query'
            if (id.includes('lucide-react')) return 'vendor-icons'
            if (id.includes('date-fns')) return 'vendor-dates'
            if (id.includes('react-dom') || id.includes('/react/')) return 'vendor-react'
          }
          if (id.includes('/src/features/organizer/')) return 'feature-organizer'
          if (id.includes('/src/features/judge/')) return 'feature-judge'
          if (id.includes('/src/pages/registration/')) return 'page-registration'
          if (id.includes('/src/pages/dashboard/')) return 'page-dashboard'
          if (id.includes('/src/pages/landing/')) return 'page-landing'
        },
      },
    },
    chunkSizeWarningLimit: 600,
    },
    preview: {
    host: '127.0.0.1',
    port: 4173,
      strictPort: true,
    },
  }
})

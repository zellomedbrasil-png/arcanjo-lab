import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Carrega TODAS as variáveis de ambiente, incluindo as sem prefixo VITE_.
  // Isso permite que o proxy de dev leia ANTHROPIC_API_KEY do .env.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor';
              if (id.includes('zustand')) return 'store';
              if (id.includes('lucide')) return 'ui';
            }
          }
        }
      }
    },
    server: {
      proxy: {
        // Proxy de desenvolvimento: /api/claude → Anthropic.
        // Injeta a chave do servidor (sem prefixo VITE_) no header.
        '/api/claude': {
          target: 'https://api.anthropic.com',
          changeOrigin: true,
          rewrite: () => '/v1/messages',
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              const apiKey = env.ANTHROPIC_API_KEY;
              if (apiKey) {
                proxyReq.setHeader('x-api-key', apiKey);
                proxyReq.setHeader('anthropic-version', '2023-06-01');
                // Remove o header de segurança perigoso: servidor→servidor não precisa
                proxyReq.removeHeader('anthropic-dangerous-direct-browser-access');
              }
            });
          },
        },
        // Proxy de desenvolvimento: /api/gemini?model=X → Google generateContent.
        // Injeta a chave do servidor (GEMINI_API_KEY, sem prefixo VITE_) na URL.
        '/api/gemini': {
          target: 'https://generativelanguage.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => {
            const query = path.split('?')[1] || '';
            const model = (new URLSearchParams(query).get('model') || 'gemini-2.5-flash').replace('google/', '');
            const apiKey = env.GEMINI_API_KEY || env.VITE_GEMINI_API_KEY || '';
            return `/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
          },
        },
      },
    },
  };
})


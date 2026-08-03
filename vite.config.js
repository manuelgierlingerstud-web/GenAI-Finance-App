import { defineConfig } from 'vite';

function apiPlugin() {
  const handleStatus = (req, res) => {
    const twelveDataKey = process.env.TWELVEDATA_API_KEY || process.env.TWELVEDATA_KEY || '';
    const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || '';
    
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      hasTwelveDataKey: Boolean(twelveDataKey),
      hasOpenRouterKey: Boolean(openRouterKey),
      systemActive: Boolean(twelveDataKey && openRouterKey),
      twelveDataKey: twelveDataKey,
      openRouterKey: openRouterKey
    }));
  };

  return {
    name: 'backend-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api/status', handleStatus);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/status', handleStatus);
    }
  };
}

export default defineConfig({
  base: './',
  plugins: [apiPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: true,
  },
});


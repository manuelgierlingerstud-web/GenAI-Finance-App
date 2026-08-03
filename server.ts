import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.get('/api/status', (req, res) => {
  const twelveDataKey = process.env.TWELVEDATA_API_KEY || process.env.TWELVEDATA_KEY || '';
  const openRouterKey = process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_KEY || '';

  res.json({
    hasTwelveDataKey: Boolean(twelveDataKey),
    hasOpenRouterKey: Boolean(openRouterKey),
    systemActive: Boolean(twelveDataKey && openRouterKey),
    twelveDataKey: twelveDataKey,
    openRouterKey: openRouterKey
  });
});

app.use(express.static(path.join(__dirname, 'dist')));

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`);
});

import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve paths
const serverDistFolder = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = resolve(serverDistFolder, '../browser');

const app = express();

/**
 * Example API route (optional)
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

/**
 * Serve static Angular files
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: 'index.html',
  }),
);

/**
 * Handle Angular routing (VERY IMPORTANT for CSR)
 * All non-file routes should return index.html
 */
app.get('*', (req, res) => {
  res.sendFile(join(browserDistFolder, 'index.html'));
});

/**
 * Start server
 */
const port = process.env['PORT'] || 4000;

app.listen(port, () => {
  console.log(`CSR server running at http://localhost:${port}`);
});


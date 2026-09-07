import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;
const HOST = '0.0.0.0';

// Next.js dynamic image proxy route
app.get('/_next/image', (req, res) => {
  const imageUrl = req.query.url;
  if (typeof imageUrl === 'string') {
    const decodedUrl = decodeURIComponent(imageUrl);
    const relativePath = decodedUrl.startsWith('/') ? decodedUrl.slice(1) : decodedUrl;
    const filePath = path.resolve(__dirname, relativePath);
    if (filePath.startsWith(__dirname) && fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
  }
  const fallback = path.join(__dirname, 'assets/brand/bobo-logo.jpg');
  if (fs.existsSync(fallback)) {
    return res.sendFile(fallback);
  }
  res.status(404).send('Not found');
});

// Support for scraped image URLs with @ query replacement
app.get('/_next/image@*', (req, res) => {
  const fallback = path.join(__dirname, 'assets/brand/bobo-logo.jpg');
  if (fs.existsSync(fallback)) {
    return res.sendFile(fallback);
  }
  res.status(404).send('Not found');
});

// Support video and audio streaming with proper byte range headers
app.use('/assets', express.static(path.join(__dirname, 'assets'), {
  maxAge: '1d',
  acceptRanges: true
}));

app.use('/_next', express.static(path.join(__dirname, '_next'), {
  maxAge: '1d',
  acceptRanges: true
}));

// Serve static assets from root
app.use(express.static(__dirname, {
  dotfiles: 'ignore',
  etag: true,
  extensions: ['html', 'htm'],
  index: 'index.html',
  maxAge: '1h'
}));

// Fallback to index.html for SPA routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, HOST, () => {
  console.log(`BOBO server running on http://${HOST}:${PORT}`);
});

const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

let browser;

// Initialize browser
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
})();

app.get('/', (req, res) => {
  res.json({
    message: 'Perchance API',
    usage: '/api?generator=YOUR_GENERATOR&list=output',
    example: '/api?generator=ai-person-generator&list=output'
  });
});

app.get('/api', async (req, res) => {
  try {
    const { generator, list = 'output' } = req.query;

    if (!generator) {
      return res.status(400).json({ error: 'Generator name required' });
    }

    const page = await browser.newPage();
    
    // Load the Perchance generator
    await page.goto(`https://perchance.org/${generator}`, {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // Wait for the generator to load
    await page.waitForTimeout(2000);

    // Execute code to get the result from the specified list
    const result = await page.evaluate((listName) => {
      if (typeof window[listName] === 'undefined') {
        return null;
      }
      // Call selectOne() method if available
      if (typeof window[listName].selectOne === 'function') {
        return window[listName].selectOne();
      }
      return null;
    }, list);

    await page.close();

    if (result === null) {
      return res.status(404).json({ error: `List '${list}' not found or no output available` });
    }

    res.json({ result });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Perchance API running on port ${port}`);
});

// Cleanup on exit
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

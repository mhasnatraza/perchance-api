const express = require('express');
const fetch = require('node-fetch');
const { JSDOM } = require('jsdom');

const app = express();
const port = process.env.PORT || 3000;

app.get('/api', async (req, res) => {
  try {
    const { generator, list = 'output' } = req.query;
    
    if (!generator) {
      return res.status(400).json({ error: 'Generator name required' });
    }

    const response = await fetch(
      `https://perchance.org/api/downloadGenerator?generatorName=${generator}&__cacheBust=${Math.random()}`
    );
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Generator not found' });
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const window = dom.window;
    
    eval(html);
    
    const result = window.root && window.root[list] 
      ? window.root[list].selectOne() 
      : 'No output';
    
    res.json({ result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Perchance API',
    usage: '/api?generator=YOUR_GENERATOR&list=output'
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Perchance API',
    usage: '/api?generator=YOUR_GENERATOR',
    example: '/api?generator=ai-person-generator'
  });
});

app.get('/api', async (req, res) => {
  try {
    const { generator } = req.query;

    if (!generator) {
      return res.status(400).json({ error: 'Generator name required' });
    }

    // Use Perchance's built-in API endpoint
    const url = `https://perchance.org/api/downloadGenerator?generatorName=${generator}&__cacheBust=${Math.random()}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Generator not found' });
    }

    const html = await response.text();
    
    // Return the raw generator code
    res.json({ 
      generator: generator,
      html: html,
      message: 'Generator HTML retrieved. To execute, visit: https://perchance.org/' + generator
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Perchance API running on port ${port}`);
});

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.json({
    message: 'Perchance API',
    usage: '/api?generator=YOUR_GENERATOR&count=1',
    example: '/api?generator=ai-person-generator&count=1',
    documentation: 'https://perchance.org/api-tutorial'
  });
});

app.get('/api', async (req, res) => {
  try {
    const { generator, count = 1 } = req.query;

    if (!generator) {
      return res.status(400).json({ error: 'Generator name required' });
    }

    // Use Perchance's official API endpoint
    const url = `https://perchance.org/api/generateList.php?generator=${generator}&count=${count}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return res.status(404).json({ error: 'Generator not found' });
    }

    const data = await response.json();
    
    // Return the results
    res.json({ 
      generator: generator,
      count: parseInt(count),
      results: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Perchance API running on port ${port}`);
});

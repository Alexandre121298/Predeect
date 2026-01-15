const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Importer votre handler
const handler = require('./api/fetch-latest-draw.js').default;

app.get('/api/fetch-latest-draw', async (req, res) => {
  await handler(req, res);
});

app.listen(3001, () => {
  console.log('API locale sur http://localhost:3001');
});
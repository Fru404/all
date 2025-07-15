const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/insert', async (req, res) => {
  const { id, title, season, episode, date, genre, link, status } = req.body;

  const { error } = await supabase.from('est').insert([
    { id, title, season, episode, date, genre, link, status },
  ]);

  if (error) {
    return res.send('Insert failed: ' + error.message);
  }

  res.send('Inserted successfully! <a href="/">Insert another</a>');
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

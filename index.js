const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const path = require('path');

const app = express();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // In case you also want to support raw JSON requests

// Multer setup to handle file uploads
const upload = multer({ dest: 'uploads/' });

// Existing /insert route
app.post('/insert', async (req, res) => {
  const { id, title, season, episode, date, genre, link, status } = req.body;

  const { error } = await supabase.from('est').insert([
    { id, title, season, episode, date, genre, link, status },
  ]);

  if (error) {
    console.error('Insert error:', error);
    return res.send('Insert failed: ' + error.message);
  }

  console.log('Insert successful:', { id, title, season, episode, date, genre, link, status });
  res.send('Inserted successfully! <a href="/">Insert another</a>');
});

// 🚀 New route to upload .json file and insert to Supabase
app.post('/upload-json', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Read and parse JSON
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    // Insert into Supabase (ensure it's an array of objects)
    const { error } = await supabase.from('est').insert(jsonData);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    if (error) {
      console.error('Insert error:', error);
      return res.status(500).send('Insert failed: ' + error.message);
    }

    res.send('JSON uploaded and inserted successfully!');
  } catch (err) {
    console.error('Error processing JSON file:', err);
    res.status(500).send('Error processing file.');
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

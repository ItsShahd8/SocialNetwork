const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static frontend assets
app.use(express.static(path.join(__dirname, 'html')));
app.use('/js', express.static(path.join(__dirname, 'js')));
app.use('/css', express.static(path.join(__dirname, 'css')));


// Fallback route (optional)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Frontend server running at http://localhost:${PORT}`);
});

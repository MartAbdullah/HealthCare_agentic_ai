const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, 'build')));

// Handle client-side routing by always responding to any route with index.html
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});

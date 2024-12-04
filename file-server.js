const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the "uploads" directory
const uploadsDir = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsDir));

// Start the server
app.listen(PORT, () => {
    console.log(`File server running at http://localhost:${PORT}/uploads`);
});

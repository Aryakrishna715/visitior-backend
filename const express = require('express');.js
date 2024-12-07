const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for the root path
app.get('/', (req, res) => {
    res.send('Hello World!'); // Respond with "Hello World" when visiting the root
});

// Start the server on port 3001
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


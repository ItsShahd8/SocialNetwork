const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory user storage (for demonstration purposes)
const users = [];

// Serve static files from the 'html' directory
app.use(express.static(path.join(__dirname, 'html')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Registration endpoint
app.post('/api/register', (req, res) => {
    const { email, username, password, first_name, last_name, dob } = req.body;

    // Save user to the "database"
    users.push({ email, username, password, first_name, last_name, dob });
    res.status(201).json({ message: 'User registered successfully!' });
});

// Login endpoint
app.post('/api/login', (req, res) => {
    const { emailOruser, password } = req.body;
    const user = users.find(u => u.emailOruser === emailOruser && u.password === password);

    if (user) {
        // Set a simple session (for demonstration)
        req.session = { user: emailOruser }; // Replace with proper session management in production
        return res.status(200).json({ message: 'Logged in successfully!' });
    }
    return res.status(401).json({ message: 'Invalid credentials' });
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    // Clear the session (for demonstration)
    req.session = null; // Replace with proper session management in production
    res.status(200).json({ message: 'Logged out successfully!' });
});

// Serve the index.html file when accessing the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
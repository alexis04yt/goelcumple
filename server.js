const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors'); // Import cors

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'datos.json');

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Helper function to read data
function readData() {
    if (!fs.existsSync(DATA_FILE)) {
        return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return data ? JSON.parse(data) : [];
}

// Helper function to write data
function writeData(data) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

// POST endpoint to save data
app.post('/submit-data', (req, res) => {
    const { nombreFamilia, confirmacionAsistencia } = req.body;
    if (!nombreFamilia || confirmacionAsistencia === undefined) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    const newData = {
        id: Date.now(), // Simple unique ID
        nombreFamilia,
        confirmacionAsistencia,
        timestamp: new Date().toISOString()
    };

    const allData = readData();
    allData.push(newData);
    writeData(allData);

    res.status(200).json({ message: 'Data saved successfully!', data: newData });
});

// GET endpoint to retrieve all data
app.get('/get-data', (req, res) => {
    const allData = readData();
    res.status(200).json(allData);
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

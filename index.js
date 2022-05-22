const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json())


// Initial check
app.get('/', (req, res) => {
    res.send('Welcome to car parts manufacture website');
});

app.listen(port, () => {
    console.log('Server is running');
})
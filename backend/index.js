const express = require('express');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Cookit API is running');
});

testConnection();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
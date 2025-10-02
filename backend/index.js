const express = require('express');
const cors = require('cors');
const { testConnection } = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// CORS (permitir frontend local en 5173)
app.use(cors());

app.get('/', (req, res) => {
    res.send('Cookit API is running');
});

app.use('/ingredients', require('./routes/ingredients'));

testConnection();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
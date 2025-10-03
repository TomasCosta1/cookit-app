const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();
require("./src/config/passport");
const { testConnection } = require('./config/database');

const app = express();

// Aviso de conexión exitosa a la base de datos
const { db } = require('./src/config/db');
db.authenticate()
  .then(() => console.log('Conexión a la base de datos exitosa'))
  .catch((err) => console.error('Error al conectar a la base de datos:', err));


// CORS para aceptar cookies desde frontend
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: "mi_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // secure: true solo en HTTPS
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Backend corriendo en http://localhost:3000");
});
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

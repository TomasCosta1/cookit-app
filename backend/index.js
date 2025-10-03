const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();
require("./config/passport");
const { testConnection } = require('./config/database'); // Usar database.js, no db.js

const app = express();

// Aviso de conexión exitosa a la base de datos
testConnection();


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

app.get('/', (req, res) => {
  res.send('Cookit API is running');
});

app.use('/ingredients', require('./routes/ingredients'));

// Solo un app.listen y sin duplicados
app.listen(process.env.PORT || 3000, () => {
  console.log("Backend corriendo en http://localhost:3000");
});

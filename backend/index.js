const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
require("dotenv").config();
require("./src/config/passport");
const { testConnection } = require('./src/config/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use(session({
  secret: "mi_secreto",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(passport.initialize());
app.use(passport.session());

// Rutas de autenticación
const authRoutes = require("./src/routes/authRoutes");
app.use("/api/auth", authRoutes);

app.get('/', (req, res) => {
  res.send('Cookit API is running');
});

app.use("/api", require("./src/routes/userRoutes"));
app.use("/api", require("./src/routes/followRoutes"));
app.use('/ingredients', require('./src/routes/ingredients'));
app.use('/recipes', require('./src/routes/recipes'));
app.use('/favorites', require('./src/routes/favorites'));
app.use('/filter', require('./src/routes/recipeFilter'));

testConnection();

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
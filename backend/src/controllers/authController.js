
const bcrypt = require("bcrypt");
const { createUser, findUserByEmail } = require("../models/User");

async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    // Verificar si ya existe
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado" });
    }

    // Hashear password
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario directamente
    await createUser({
      username,
      email,
      passwordHash,
      role: "cliente",
      provider: "local"
    });

    res.status(201).json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// Login local
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { findUserByEmail } = require("../models/User");
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
    }
    if (!user.password) {
      return res.status(400).json({ message: "Usuario registrado con Google. Usa Google para iniciar sesión." });
    }
    const valid = await require("bcrypt").compare(password, user.password);
    if (!valid) {
      return res.status(400).json({ message: "Usuario o contraseña incorrectos" });
    }
    // Aquí podrías crear una sesión o token si lo deseas
    res.json({ message: "Login exitoso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

module.exports = { register, login };

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail } = require("../models/User");

const SECRET = process.env.JWT_SECRET || "cookit_secret";

// Registro
async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "Todos los campos son obligatorios" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Formato de email inválido" });

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "El email ya está registrado" });

    const passwordHash = await bcrypt.hash(password, 10);

    await createUser({
      username,
      email,
      password: passwordHash,
      role: "cliente",
      provider: "local",
    });

    res.status(201).json({ message: "Usuario registrado correctamente." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// Login
async function login(req, res) {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return res.status(400).json({ message: "Usuario o contraseña incorrectos" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Usuario o contraseña incorrectos" });

    // Crear token JWT
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      SECRET,
      { expiresIn: "1h" }
    );

    // Enviar cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });

    res.json({ message: "Login exitoso", username: user.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
}

// Perfil
function profile(req, res) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    return res.json({ user: decoded });
  } catch (err) {
    return res.status(401).json({ message: "Token inválido o expirado" });
  }
}

// Logout
function logout(req, res) {
  res.clearCookie("token");
  res.json({ message: "Sesión cerrada correctamente" });
}

module.exports = { register, login, profile, logout };

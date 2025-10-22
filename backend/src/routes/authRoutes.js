const express = require('express');
const passport = require('passport');
const router = express.Router();
const jwt = require("jsonwebtoken");

const { login, register, profile, logout } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);
router.get('/profile', profile);
router.post("/logout", logout);

// Login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  (req, res) => {
    if (!req.user) {
      return res.redirect('/login');
    }

    const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';

    // Crear token JWT igual que en tu login local
    const token = jwt.sign(
      {
        id: req.user.id,
        username: req.user.username || req.user.displayName,
        email: req.user.email,
      },
      process.env.JWT_SECRET || 'cookit_secret',
      { expiresIn: '1h' }
    );

    // Enviar cookie segura
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });

    // Redirigir al frontend
    res.redirect(`${frontend}/profile`);
  }
);


module.exports = router;

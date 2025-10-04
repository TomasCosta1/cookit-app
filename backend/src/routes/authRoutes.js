const express = require('express');
const passport = require('passport');
const router = express.Router();

const { login, register } = require('../controllers/authController');

router.post('/login', login);
router.post('/register', register);

// Login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    if (req.user) {
      const frontend = process.env.FRONTEND_URL || 'http://localhost:5173';
      // Redirige al Home con nombre
      res.redirect(`${frontend}/?name=${encodeURIComponent(req.user.username || req.user.displayName)}`);
    } else {
      res.redirect('/login');
    }
  }
);

module.exports = router;

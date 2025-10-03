const express = require('express');
const passport = require('passport');
const router = express.Router();


const { login, register } = require('../controllers/authcontroller');
router.post('/login', login);
router.post('/register', register);

// Login con Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Callback de Google
router.get('/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Redirigir de forma segura sin exponer el email en la URL
    if (req.user?.is_verified) {
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    } else {
      // Redirige a la página de confirmación sin pasar el email por query
      res.redirect((process.env.FRONTEND_URL || 'http://localhost:5173') + '/confirm-email');
    }
  }
);

module.exports = router;



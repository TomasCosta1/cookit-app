
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
    // Si el usuario está verificado, ir al home; si no, pedir confirmación de mail
    const email = req.user?.email;
    if (req.user?.is_verified) {
      res.redirect(process.env.FRONTEND_URL || 'http://localhost:5173');
    } else {
      const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/confirm-email${email ? `?email=${encodeURIComponent(email)}` : ''}`;
      res.redirect(redirectUrl);
    }
  }
);

module.exports = router;



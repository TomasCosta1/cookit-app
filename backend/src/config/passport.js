
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { User } = require('../models/User'); // tu modelo de usuario

// Serialización y deserialización de usuario para sesiones
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por email
      let user = await User.findOne({ where: { email: profile.emails[0].value } });

      // Si no existe, crearlo
      if (!user) {
        user = await User.create({
          username: profile.displayName,
          email: profile.emails[0].value,
          password: null,
          provider: 'google',
          is_verified: false,
          role: 'cliente'
        });
      }

      // Solo enviar código de verificación si es un registro nuevo
      if (!user.is_verified && profile._json && profile._json.email_verified === false) {
        const { db } = require('../config/db');
        const { transporter } = require('../config/mailer');
        const verificationCode = Math.floor(100000 + Math.random() * 900000);
        await db.query(
          `INSERT INTO verification_codes (user_id, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 15 MINUTE))`,
          { replacements: [user.id, verificationCode] }
        );
        await transporter.sendMail({
          from: "mazzajoaquin22@gmail.com",
          to: user.email,
          subject: "Verifica tu cuenta",
          text: `Tu código de verificación es: ${verificationCode}`
        }, (err, info) => {
          if (err) {
            console.error('Error enviando mail de verificación Google:', err);
          } else {
            console.log('Mail de verificación Google enviado:', info.response);
          }
        });
      }

  return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));

// Serialización y deserialización de usuario para sesiones
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

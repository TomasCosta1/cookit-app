
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

  return done(null, user);
    } catch (err) {
      return done(err, null);
    }
  }
));


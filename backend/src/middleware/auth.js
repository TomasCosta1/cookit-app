const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    // Passport guarda el usuario en req.user
    return next();
  } else {
    return res.status(401).json({ message: "No autorizado" });
  }
};

module.exports = isAuthenticated;


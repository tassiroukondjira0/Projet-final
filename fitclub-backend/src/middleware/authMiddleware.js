const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Vérifie que l'utilisateur est authentifié (token JWT valide)
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      req.user = await User.findById(decoded.id);
      if (!req.user) {
        return res.status(401).json({ message: 'Utilisateur introuvable' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token invalide ou expiré' });
    }
  }

  return res.status(401).json({ message: 'Non autorisé, token manquant' });
};

// Restreint l'accès à certains rôles, ex : authorize('admin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Accès refusé : rôle non autorisé' });
    }
    next();
  };
};

module.exports = { protect, authorize };

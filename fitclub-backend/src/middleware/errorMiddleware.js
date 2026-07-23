const notFound = (req, res, next) => {
  const error = new Error(`Route non trouvée : ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Toujours logger l'erreur complète côté serveur (visible dans les logs
  // Render/Railway), même en production — sinon un 500 est totalement
  // silencieux et impossible à diagnostiquer depuis les logs.
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Ressource introuvable (identifiant invalide)';
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(', ');
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `La valeur du champ '${field}' existe déjà`;
  }

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
};

module.exports = { notFound, errorHandler };

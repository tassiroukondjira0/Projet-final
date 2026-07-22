const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const trackAnalytics = require('./middleware/analyticsMiddleware');

const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const courseRoutes = require('./routes/courseRoutes');
const contactRoutes = require('./routes/contactRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const coachRoutes = require('./routes/coachRoutes');

const app = express();

// CLIENT_URL peut contenir un ou plusieurs domaines séparés par des virgules
// (ex : votre domaine de prod Vercel + des URLs de preview). La comparaison
// ignore volontairement un "/" final, car les navigateurs n'en envoient
// jamais dans l'en-tête Origin — une erreur de copier-coller fréquente sinon.
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((o) => o.trim().replace(/\/$/, ''))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Pas d'origine (ex : Postman, curl, requêtes serveur-à-serveur) : autorisé
      if (!origin) return callback(null, true);
      const normalized = origin.replace(/\/$/, '');
      if (allowedOrigins.length === 0 || allowedOrigins.includes(normalized)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Origine refusée : ${origin}`);
      return callback(new Error('Non autorisé par CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Journalise chaque requête API pour les statistiques du dashboard
app.use(trackAnalytics);

// Route de santé (utile pour vérifier que le déploiement fonctionne)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API FitClub opérationnelle' });
});

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/coaches', coachRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

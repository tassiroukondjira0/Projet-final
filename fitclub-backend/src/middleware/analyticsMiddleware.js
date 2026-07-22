const AnalyticsEvent = require('../models/AnalyticsEvent');

// Déduit une catégorie d'appareil simple à partir du User-Agent.
// Volontairement basique (pas de librairie externe) : suffisant pour
// alimenter le graphique "trafic par appareil" du dashboard avec de
// vraies données plutôt que des chiffres statiques.
const detectDevice = (userAgent = '') => {
  const ua = userAgent.toLowerCase();
  if (ua.includes('iphone') || ua.includes('ipad') || ua.includes('ios')) return 'iOS';
  if (ua.includes('android')) return 'Android';
  if (ua.includes('windows')) return 'Windows';
  if (ua.includes('mac os') || ua.includes('macintosh')) return 'Mac';
  if (ua.includes('linux')) return 'Linux';
  return 'Other';
};

// Journalise chaque requête API de façon asynchrone (sans bloquer la réponse).
const trackAnalytics = (req, _res, next) => {
  const device = detectDevice(req.headers['user-agent']);
  AnalyticsEvent.create({ device }).catch(() => {
    // Erreur silencieuse : l'analytics ne doit jamais faire échouer une requête
  });
  next();
};

module.exports = trackAnalytics;

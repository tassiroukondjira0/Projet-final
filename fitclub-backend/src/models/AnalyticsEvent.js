const mongoose = require('mongoose');

// Chaque requête reçue par l'API est journalisée ici (catégorie d'appareil
// déduite du User-Agent) afin que le dashboard admin affiche de vraies
// statistiques plutôt que des chiffres inventés.
const analyticsEventSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      enum: ['iOS', 'Android', 'Windows', 'Mac', 'Linux', 'Other'],
      default: 'Other',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalyticsEvent', analyticsEventSchema);

const crypto = require('crypto');
const Booking = require('../models/Booking');

// @desc    Traiter le paiement d'une réservation
// @route   POST /api/payments/process
// @access  Privé
// @body    { bookingId, paymentMethod, phoneNumber?, cardDetails? }
//
// NOTE PÉDAGOGIQUE : aucune passerelle de paiement réelle (Wave, Orange
// Money, Stripe...) n'est intégrée ici — cela nécessiterait des identifiants
// marchands que nous n'avons pas pour ce projet scolaire. Le paiement est
// donc SIMULÉ : il est toujours marqué "completed" après validation des
// champs. Pour une vraie mise en production, cette fonction est le point
// d'intégration où appeler l'API du prestataire de paiement choisi.
const processPayment = async (req, res, next) => {
  try {
    const { bookingId, paymentMethod, phoneNumber } = req.body;

    if (!bookingId || !paymentMethod) {
      return res.status(400).json({ message: 'bookingId et paymentMethod sont requis' });
    }

    if (!['wave', 'orange_money', 'card'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Méthode de paiement invalide' });
    }

    if ((paymentMethod === 'wave' || paymentMethod === 'orange_money') && !phoneNumber) {
      return res.status(400).json({ message: 'Le numéro de téléphone est requis pour ce mode de paiement' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Réservation introuvable' });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    // Idempotence : si déjà payé, on renvoie le résultat existant sans le retraiter.
    if (booking.paymentStatus === 'completed') {
      return res.json({
        payment: { id: booking.paymentId, status: booking.paymentStatus },
      });
    }

    const paymentId = `PAY-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    booking.paymentMethod = paymentMethod;
    booking.paymentId = paymentId;
    booking.paymentStatus = 'completed'; // simulation : toujours réussi
    await booking.save();

    res.json({
      payment: { id: paymentId, status: booking.paymentStatus },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Statut d'un paiement
// @route   GET /api/payments/:id
// @access  Privé
const getPaymentStatus = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ paymentId: req.params.id });
    if (!booking) {
      return res.status(404).json({ message: 'Paiement introuvable' });
    }

    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    res.json({
      status: booking.paymentStatus,
      bookingId: booking._id.toString(),
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { processPayment, getPaymentStatus };

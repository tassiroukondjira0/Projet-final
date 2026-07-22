const Booking = require('../models/Booking');
const Course = require('../models/Course');
const PRICING = require('../utils/pricing');

// @desc    Créer une réservation
// @route   POST /api/bookings
// @access  Privé
// @body    { courseId, subscriptionType }
const createBooking = async (req, res, next) => {
  try {
    const { courseId, subscriptionType } = req.body;

    if (!courseId || !subscriptionType) {
      return res.status(400).json({ message: 'courseId et subscriptionType sont requis' });
    }

    if (!PRICING[subscriptionType]) {
      return res.status(400).json({ message: 'Type d\'abonnement invalide' });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Cours introuvable' });
    }

    // Le montant est toujours calculé côté serveur à partir de la grille
    // tarifaire officielle : on ne fait jamais confiance à un montant envoyé par le client.
    const booking = await Booking.create({
      userId: req.user._id,
      courseId,
      subscriptionType,
      amount: PRICING[subscriptionType],
      paymentStatus: 'pending',
    });

    res.status(201).json({ booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Mes réservations
// @route   GET /api/bookings/me
// @access  Privé
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id }).sort('-createdAt');
    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

// @desc    Liste des inscrits à un cours (élèves d'un coach)
// @route   GET /api/bookings/course/:courseId
// @access  Privé (coach propriétaire du cours, ou admin)
const getCourseBookings = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: 'Cours introuvable' });

    const isOwner = course.coachId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const bookings = await Booking.find({ courseId: req.params.courseId })
      .populate('userId', 'name email phone')
      .sort('-createdAt');

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

module.exports = { createBooking, getMyBookings, getCourseBookings };

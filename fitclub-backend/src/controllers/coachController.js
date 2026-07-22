const User = require('../models/User');

// @desc    Créer un compte coach
// @route   POST /api/coaches
// @access  Privé (admin)
//
// Par sécurité, un compte coach ne peut PAS être créé via l'inscription
// publique (/api/auth/register, qui force toujours role: "client").
// Seul un admin peut créer un compte coach, avec un mot de passe temporaire
// que le coach pourra changer une fois connecté.
// @body    { name, email, password, phone, bio, specialty }
const createCoach = async (req, res, next) => {
  try {
    const { name, email, password, phone, bio, specialty } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const coach = await User.create({
      name,
      email,
      password,
      phone,
      bio,
      specialty,
      role: 'coach',
    });

    res.status(201).json({ coach });
  } catch (error) {
    next(error);
  }
};

// @desc    Liste des comptes coach
// @route   GET /api/coaches
// @access  Privé (admin)
const getCoaches = async (req, res, next) => {
  try {
    const coaches = await User.find({ role: 'coach' }).sort('name');
    res.json({ coaches });
  } catch (error) {
    next(error);
  }
};

// @desc    Détail d'un coach
// @route   GET /api/coaches/:id
// @access  Privé (admin, ou le coach lui-même)
const getCoachById = async (req, res, next) => {
  try {
    const coach = await User.findOne({ _id: req.params.id, role: 'coach' });
    if (!coach) return res.status(404).json({ message: 'Coach introuvable' });
    res.json({ coach });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour un profil coach (bio, spécialité, téléphone...)
// @route   PATCH /api/coaches/:id
// @access  Privé (admin, ou le coach lui-même)
const updateCoach = async (req, res, next) => {
  try {
    const isSelf = req.user._id.toString() === req.params.id;
    if (req.user.role !== 'admin' && !isSelf) {
      return res.status(403).json({ message: 'Accès refusé' });
    }

    const { name, phone, bio, specialty } = req.body;
    const coach = await User.findOneAndUpdate(
      { _id: req.params.id, role: 'coach' },
      { name, phone, bio, specialty },
      { new: true, runValidators: true }
    );

    if (!coach) return res.status(404).json({ message: 'Coach introuvable' });
    res.json({ coach });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer un compte coach
// @route   DELETE /api/coaches/:id
// @access  Privé (admin)
const deleteCoach = async (req, res, next) => {
  try {
    const coach = await User.findOneAndDelete({ _id: req.params.id, role: 'coach' });
    if (!coach) return res.status(404).json({ message: 'Coach introuvable' });
    res.json({ message: 'Coach supprimé' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCoach, getCoaches, getCoachById, updateCoach, deleteCoach };

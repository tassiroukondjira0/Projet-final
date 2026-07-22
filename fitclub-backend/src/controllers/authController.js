const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Inscription
// @route   POST /api/auth/register
// @access  Public
// @body    { name, email, password, phone, birthDate, address, city, country }
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, birthDate, address, city, country } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nom, email et mot de passe sont requis' });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const user = await User.create({
      name,
      email,
      password,
      phone,
      birthDate,
      address,
      city,
      country,
      role: 'client', // l'inscription publique ne peut jamais créer un admin
    });

    res.status(201).json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connexion
// @route   POST /api/auth/login
// @access  Public
// @body    { email, password }
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email?.toLowerCase() }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
      token: generateToken(user._id),
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Demande de réinitialisation de mot de passe
// @route   POST /api/auth/forgot-password
// @access  Public
// @body    { email }
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email?.toLowerCase() });

    // NOTE : aucun service d'envoi d'email n'est branché ici (nécessiterait
    // un fournisseur SMTP type Nodemailer/SendGrid). Pour la démonstration,
    // on se contente de journaliser un jeton dans la console du serveur et
    // de renvoyer un message générique — qu'un compte existe ou non, pour
    // ne pas révéler quels emails sont enregistrés.
    if (user) {
      const resetToken = generateToken(user._id);
      console.log(`[reset-password] Lien de réinitialisation pour ${email} : token=${resetToken}`);
    }

    res.json({
      message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Profil de l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Privé
const getMe = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    next(error);
  }
};

// @desc    Mettre à jour le profil de l'utilisateur connecté
// @route   PATCH /api/auth/me
// @access  Privé
const updateMe = async (req, res, next) => {
  try {
    const { name, email, phone, birthDate, address, city, country } = req.body;

    if (email && email.toLowerCase() !== req.user.email) {
      const emailTaken = await User.findOne({ email: email.toLowerCase() });
      if (emailTaken) {
        return res.status(400).json({ message: 'Cet email est déjà utilisé' });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email, phone, birthDate, address, city, country },
      { new: true, runValidators: true }
    );

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, forgotPassword, getMe, updateMe };

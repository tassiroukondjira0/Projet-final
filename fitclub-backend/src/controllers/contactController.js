const ContactMessage = require('../models/ContactMessage');

// @desc    Envoyer un message de contact
// @route   POST /api/contact
// @access  Public
// @body    { firstName, lastName, email, message }
const sendContactMessage = async (req, res, next) => {
  try {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
      return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    await ContactMessage.create({ firstName, lastName, email, message });

    res.status(201).json({
      message: 'Votre message a bien été envoyé, nous vous répondrons rapidement.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { sendContactMessage };

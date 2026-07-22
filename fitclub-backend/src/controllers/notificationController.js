const Notification = require('../models/Notification');

// @desc    Créer une notification
// @route   POST /api/notifications
// @access  Private (Admin/System)
const createNotification = async (req, res, next) => {
  try {
    const { userId, type, title, message, data } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({ 
        message: 'Les champs userId, type, title et message sont requis' 
      });
    }

    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      data: data || {},
    });

    res.status(201).json({
      message: 'Notification créée avec succès',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Récupérer les notifications d'un utilisateur
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id; // from auth middleware
    const { read, type } = req.query;

    let filter = { userId };

    if (read !== undefined && read !== '') {
      filter.read = read === 'true';
    }

    if (type) {
      filter.type = type;
    }

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ 
      notifications,
      unreadCount: notifications.filter(n => !n.read).length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer une notification comme lue
// @route   PATCH /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    notification.read = true;
    await notification.save();

    res.json({ 
      message: 'Notification marquée comme lue',
      notification,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Marquer toutes les notifications comme lues
// @route   PATCH /api/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    next(error);
  }
};

// @desc    Supprimer une notification
// @route   DELETE /api/notifications/:id
// @access  Private
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification introuvable' });
    }

    await notification.deleteOne();

    res.json({ message: 'Notification supprimée avec succès' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
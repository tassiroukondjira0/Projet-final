const express = require('express');
const router = express.Router();
const {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent une authentification
router.use(authorize);

// @route   POST /api/notifications
// @desc    Créer une notification (admin/system)
// @access  Admin
router.post('/', createNotification);

// @route   GET /api/notifications
// @desc    Récupérer les notifications de l'utilisateur connecté
// @access  Private
router.get('/', getNotifications);

// @route   PATCH /api/notifications/:id/read
// @desc    Marquer une notification comme lue
// @access  Private
router.patch('/:id/read', markAsRead);

// @route   PATCH /api/notifications/read-all
// @desc    Marquer toutes les notifications comme lues
// @access  Private
router.patch('/read-all', markAllAsRead);

// @route   DELETE /api/notifications/:id
// @desc    Supprimer une notification
// @access  Private
router.delete('/:id', deleteNotification);

module.exports = router;
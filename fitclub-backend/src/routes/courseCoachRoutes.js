const express = require('express');
const router = express.Router();
const {
  getCourseCoaches,
  addCoachToCourse,
  removeCoachFromCourse,
} = require('../controllers/courseCoachController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Toutes les routes nécessitent d'être admin
router.use(protect);
router.use(authorize('admin'));

// GET /api/courses/:courseId/coaches - Obtenir les coachs d'un cours
router.get('/:courseId/coaches', getCourseCoaches);

// POST /api/courses/:courseId/coaches - Ajouter un coach à un cours
router.post('/:courseId/coaches', addCoachToCourse);

// DELETE /api/courses/:courseId/coaches/:coachId - Supprimer un coach d'un cours
router.delete('/:courseId/coaches/:coachId', removeCoachFromCourse);

module.exports = router;
const express = require('express');
const router = express.Router();
const {
  getCourses,
  getCourseById,
  getMyCourses,
  getCourseCoaches,
  addCoachToCourse,
  removeCoachFromCourse,
} = require('../controllers/courseController');
const { protect, authorize } = require('../middleware/authMiddleware');

// IMPORTANT : "/mine" doit être déclaré avant "/:id" pour ne pas être
// intercepté par la route paramétrée (sinon Express chercherait un cours
// dont l'id est littéralement "mine").
router.get('/mine', protect, authorize('coach'), getMyCourses);
router.get('/', getCourses);
router.get('/:id', getCourseById);

// Gestion des coachs assignés à un cours (dashboard admin)
router.get('/:courseId/coaches', protect, authorize('admin'), getCourseCoaches);
router.post('/:courseId/coaches', protect, authorize('admin'), addCoachToCourse);
router.delete('/:courseId/coaches/:coachId', protect, authorize('admin'), removeCoachFromCourse);

module.exports = router;

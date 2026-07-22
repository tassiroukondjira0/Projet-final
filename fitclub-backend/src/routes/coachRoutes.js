const express = require('express');
const router = express.Router();
const {
  createCoach,
  getCoaches,
  getCoachById,
  updateCoach,
  deleteCoach,
} = require('../controllers/coachController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('admin'), createCoach);
router.get('/', protect, authorize('admin'), getCoaches);
router.get('/:id', protect, authorize('admin', 'coach'), getCoachById);
router.patch('/:id', protect, authorize('admin', 'coach'), updateCoach);
router.delete('/:id', protect, authorize('admin'), deleteCoach);

module.exports = router;

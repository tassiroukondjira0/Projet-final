const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getCourseBookings } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, createBooking);
router.get('/me', protect, getMyBookings);
router.get('/course/:courseId', protect, authorize('coach', 'admin'), getCourseBookings);

module.exports = router;

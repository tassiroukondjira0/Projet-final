const express = require('express');
const router = express.Router();
const { processPayment, getPaymentStatus } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.post('/process', protect, processPayment);
router.get('/:id', protect, getPaymentStatus);

module.exports = router;

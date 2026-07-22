const express = require('express');
const router = express.Router();
const { getOverview, getClients } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/overview', protect, getOverview);
router.get('/clients', protect, authorize('admin'), getClients);

module.exports = router;

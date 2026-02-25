const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { getThread, sendMessage } = require('../controllers/messages.controller');

router.get('/:userId', protect, getThread);
router.post('/:userId', protect, sendMessage);

module.exports = router;

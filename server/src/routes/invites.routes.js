const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const { generateInvite, acceptInvite, sendInvite } = require('../controllers/invites.controller');

router.post('/generate', protect, generateInvite);
router.post('/send', protect, sendInvite);    // multi-platform invite
router.post('/accept', acceptInvite);          // public — used during signup

module.exports = router;

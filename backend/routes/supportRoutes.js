const express = require('express');
const router = express.Router();
const { sendSupportEmail } = require('../controllers/supportController');

// Send support email
router.post('/send-email', sendSupportEmail);

module.exports = router;
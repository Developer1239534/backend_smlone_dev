const express = require('express');
const router = express.Router();
const { handleGiftClaim } = require('../controllers/giftClaimController');

router.post('/claim', handleGiftClaim);

module.exports = router;

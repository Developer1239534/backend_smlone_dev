const express = require('express');
const router = express.Router();
const { handleGiftClaim } = require('../controllers/giftClaimController');
const { handleScanRedeem } = require('../portal/myby_coin/controllers/coinAdminController');

router.post('/claim', handleGiftClaim);
router.post('/scan', handleScanRedeem);

module.exports = router;

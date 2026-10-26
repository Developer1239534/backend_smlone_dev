const express = require('express');
const router = express.Router();
const { handleGiftClaim } = require('../controllers/giftClaimController');
const { handleScanRedeem } = require('../portal/myby_coin/controllers/coinAdminController');
const { handleGetRewards } = require('../portal/myby_coin/controllers/rewardController');

router.get('/', handleGetRewards);
router.post('/claim', handleGiftClaim);
router.post('/scan', handleScanRedeem);

module.exports = router;

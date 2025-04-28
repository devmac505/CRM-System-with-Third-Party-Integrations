const express = require('express');
const {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  sendCampaign
} = require('../controllers/campaignController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getCampaigns)
  .post(protect, authorize('admin', 'manager'), createCampaign);

router
  .route('/:id')
  .get(protect, getCampaign)
  .put(protect, authorize('admin', 'manager'), updateCampaign)
  .delete(protect, authorize('admin', 'manager'), deleteCampaign);

router.post('/:id/send', protect, authorize('admin', 'manager'), sendCampaign);

module.exports = router;

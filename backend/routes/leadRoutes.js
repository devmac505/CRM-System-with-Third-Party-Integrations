const express = require('express');
const {
  getLeads,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  addInteraction
} = require('../controllers/leadController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router
  .route('/')
  .get(protect, getLeads)
  .post(protect, createLead);

router
  .route('/:id')
  .get(protect, getLead)
  .put(protect, updateLead)
  .delete(protect, authorize('admin', 'manager'), deleteLead);

router.post('/:id/interactions', protect, addInteraction);

module.exports = router;

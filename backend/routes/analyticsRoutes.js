const express = require('express');
const {
  getDashboardSummary,
  getRevenueAnalytics,
  getCustomerAnalytics,
  getLeadAnalytics,
  getCampaignAnalytics,
  getProductAnalytics,
  exportAnalyticsData
} = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(protect);

// Dashboard summary
router.get('/dashboard-summary', getDashboardSummary);

// Specific analytics endpoints
router.get('/revenue', getRevenueAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/leads', getLeadAnalytics);
router.get('/campaigns', getCampaignAnalytics);
router.get('/products', getProductAnalytics);

// Export data endpoint
router.get('/export', exportAnalyticsData);

module.exports = router;

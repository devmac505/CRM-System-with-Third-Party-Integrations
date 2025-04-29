import axios from './axios';

/**
 * Get revenue analytics data
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - Revenue analytics data
 */
export const getRevenueAnalytics = async (timeRange = 'month') => {
  const response = await axios.get(`/analytics/revenue?timeRange=${timeRange}`);
  return response.data;
};

/**
 * Get customer analytics data
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - Customer analytics data
 */
export const getCustomerAnalytics = async (timeRange = 'month') => {
  const response = await axios.get(`/analytics/customers?timeRange=${timeRange}`);
  return response.data;
};

/**
 * Get lead analytics data
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - Lead analytics data
 */
export const getLeadAnalytics = async (timeRange = 'month') => {
  const response = await axios.get(`/analytics/leads?timeRange=${timeRange}`);
  return response.data;
};

/**
 * Get product analytics data
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - Product analytics data
 */
export const getProductAnalytics = async (timeRange = 'month') => {
  const response = await axios.get(`/analytics/products?timeRange=${timeRange}`);
  return response.data;
};

/**
 * Get campaign analytics data
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - Campaign analytics data
 */
export const getCampaignAnalytics = async (timeRange = 'month') => {
  const response = await axios.get(`/analytics/campaigns?timeRange=${timeRange}`);
  return response.data;
};

/**
 * Get dashboard summary analytics
 * @returns {Promise<object>} - Dashboard summary data
 */
export const getDashboardSummary = async () => {
  const response = await axios.get('/analytics/dashboard-summary');
  return response.data;
};

/**
 * Export analytics data as CSV
 * @param {string} type - Type of data to export (revenue, customers, leads, etc.)
 * @param {string} timeRange - Time range for the data (week, month, quarter, year)
 * @returns {Promise<object>} - CSV data
 */
export const exportAnalyticsData = async (type, timeRange = 'month') => {
  const response = await axios.get(`/analytics/export?type=${type}&timeRange=${timeRange}`, {
    responseType: 'blob'
  });
  return response.data;
};

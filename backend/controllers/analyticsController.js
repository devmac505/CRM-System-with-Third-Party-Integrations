const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Order = require('../models/Order');
const Campaign = require('../models/Campaign');
const moment = require('moment');
const { Parser } = require('json2csv');

/**
 * @desc    Get dashboard summary data
 * @route   GET /api/analytics/dashboard-summary
 * @access  Private
 */
exports.getDashboardSummary = async (req, res) => {
  try {
    // Get current date and date from 30 days ago
    const currentDate = new Date();
    const thirtyDaysAgo = new Date(currentDate);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sixtyDaysAgo = new Date(currentDate);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Get current month and previous month
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    // Get current month start and end dates
    const currentMonthStart = new Date(currentYear, currentMonth, 1);
    const currentMonthEnd = new Date(currentYear, currentMonth + 1, 0);
    
    // Get previous month start and end dates
    const previousMonthStart = new Date(previousMonthYear, previousMonth, 1);
    const previousMonthEnd = new Date(previousMonthYear, previousMonth + 1, 0);

    // Get customers data
    const [
      currentCustomers,
      previousCustomers,
      currentLeads,
      previousLeads,
      currentOrders,
      previousOrders,
      currentCampaigns,
      previousCampaigns
    ] = await Promise.all([
      // Current period customers
      Customer.countDocuments({
        createdAt: { $gte: thirtyDaysAgo, $lte: currentDate }
      }),
      
      // Previous period customers
      Customer.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo }
      }),
      
      // Current period leads
      Lead.countDocuments({
        createdAt: { $gte: thirtyDaysAgo, $lte: currentDate }
      }),
      
      // Previous period leads
      Lead.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo }
      }),
      
      // Current period orders
      Order.find({
        createdAt: { $gte: thirtyDaysAgo, $lte: currentDate }
      }),
      
      // Previous period orders
      Order.find({
        createdAt: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo }
      }),
      
      // Current period campaigns
      Campaign.countDocuments({
        createdAt: { $gte: thirtyDaysAgo, $lte: currentDate }
      }),
      
      // Previous period campaigns
      Campaign.countDocuments({
        createdAt: { $gte: sixtyDaysAgo, $lte: thirtyDaysAgo }
      })
    ]);

    // Calculate revenue
    const currentRevenue = currentOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const previousRevenue = previousOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Calculate growth percentages
    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const customerGrowth = calculateGrowth(currentCustomers, previousCustomers);
    const leadGrowth = calculateGrowth(currentLeads, previousLeads);
    const revenueGrowth = calculateGrowth(currentRevenue, previousRevenue);
    const campaignGrowth = calculateGrowth(currentCampaigns, previousCampaigns);

    // Generate chart data for revenue
    const revenueChartData = await generateRevenueChartData();
    const leadsChartData = await generateLeadsChartData();

    res.status(200).json({
      success: true,
      data: {
        customerGrowth,
        leadGrowth,
        revenueGrowth,
        campaignGrowth,
        revenueChart: revenueChartData,
        leadsChart: leadsChartData
      }
    });
  } catch (error) {
    console.error('Error getting dashboard summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get revenue analytics
 * @route   GET /api/analytics/revenue
 * @access  Private
 */
exports.getRevenueAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const revenueData = await generateRevenueChartData(timeRange);
    
    res.status(200).json({
      success: true,
      data: revenueData
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get customer analytics
 * @route   GET /api/analytics/customers
 * @access  Private
 */
exports.getCustomerAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const customerData = await generateCustomerChartData(timeRange);
    
    res.status(200).json({
      success: true,
      data: customerData
    });
  } catch (error) {
    console.error('Error getting customer analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get lead analytics
 * @route   GET /api/analytics/leads
 * @access  Private
 */
exports.getLeadAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    const leadData = await generateLeadsChartData(timeRange);
    
    // Get lead sources distribution
    const leadSources = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    // Get lead status distribution
    const leadStatuses = await Lead.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        chartData: leadData,
        leadSources: leadSources.map(source => ({
          source: source._id || 'Unknown',
          count: source.count
        })),
        leadStatuses: leadStatuses.map(status => ({
          status: status._id || 'Unknown',
          count: status.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting lead analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get campaign analytics
 * @route   GET /api/analytics/campaigns
 * @access  Private
 */
exports.getCampaignAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Get date range based on timeRange
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
    
    // Get campaigns within date range
    const campaigns = await Campaign.find({
      createdAt: { $gte: startDate, $lte: endDate }
    }).sort({ createdAt: 1 });
    
    // Calculate campaign metrics
    const campaignMetrics = campaigns.map(campaign => {
      const metrics = campaign.metrics || {};
      const openRate = metrics.sent > 0 ? (metrics.opened / metrics.sent) * 100 : 0;
      const clickRate = metrics.opened > 0 ? (metrics.clicked / metrics.opened) * 100 : 0;
      
      return {
        id: campaign._id,
        name: campaign.name,
        type: campaign.type,
        status: campaign.status,
        sent: metrics.sent || 0,
        delivered: metrics.delivered || 0,
        opened: metrics.opened || 0,
        clicked: metrics.clicked || 0,
        openRate: openRate.toFixed(1),
        clickRate: clickRate.toFixed(1),
        createdAt: campaign.createdAt
      };
    });
    
    // Get campaign type distribution
    const campaignTypes = await Campaign.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        campaigns: campaignMetrics,
        campaignTypes: campaignTypes.map(type => ({
          type: type._id || 'Unknown',
          count: type.count
        }))
      }
    });
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get product analytics
 * @route   GET /api/analytics/products
 * @access  Private
 */
exports.getProductAnalytics = async (req, res) => {
  try {
    const { timeRange = 'month' } = req.query;
    
    // Get date range based on timeRange
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
    
    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Extract products from orders and calculate sales
    const productMap = new Map();
    
    orders.forEach(order => {
      const items = order.items || [];
      items.forEach(item => {
        const productId = item.product?.toString() || 'Unknown';
        const productName = item.productName || 'Unknown Product';
        const quantity = item.quantity || 0;
        const price = item.price || 0;
        const totalAmount = quantity * price;
        
        if (productMap.has(productId)) {
          const product = productMap.get(productId);
          product.quantity += quantity;
          product.totalAmount += totalAmount;
          product.orderCount += 1;
        } else {
          productMap.set(productId, {
            id: productId,
            name: productName,
            quantity,
            totalAmount,
            orderCount: 1
          });
        }
      });
    });
    
    // Convert map to array and sort by total amount
    const productSales = Array.from(productMap.values())
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    res.status(200).json({
      success: true,
      data: {
        products: productSales,
        totalProducts: productSales.length,
        totalSales: productSales.reduce((sum, product) => sum + product.totalAmount, 0)
      }
    });
  } catch (error) {
    console.error('Error getting product analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Export analytics data as CSV
 * @route   GET /api/analytics/export
 * @access  Private
 */
exports.exportAnalyticsData = async (req, res) => {
  try {
    const { type, timeRange = 'month' } = req.query;
    
    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Export type is required'
      });
    }
    
    let data = [];
    let fields = [];
    let filename = '';
    
    // Get date range based on timeRange
    const { startDate, endDate } = getDateRangeFromTimeRange(timeRange);
    
    switch (type) {
      case 'customers':
        data = await Customer.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).select('-__v -password');
        
        fields = ['_id', 'name', 'email', 'phone', 'company', 'address', 'tags', 'createdAt', 'updatedAt'];
        filename = 'customers_export.csv';
        break;
        
      case 'leads':
        data = await Lead.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).select('-__v');
        
        fields = ['_id', 'name', 'email', 'phone', 'company', 'source', 'status', 'value', 'createdAt', 'updatedAt'];
        filename = 'leads_export.csv';
        break;
        
      case 'orders':
        data = await Order.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).select('-__v');
        
        fields = ['_id', 'customer', 'status', 'totalAmount', 'paymentStatus', 'createdAt', 'updatedAt'];
        filename = 'orders_export.csv';
        break;
        
      case 'campaigns':
        data = await Campaign.find({
          createdAt: { $gte: startDate, $lte: endDate }
        }).select('-__v -content');
        
        fields = ['_id', 'name', 'type', 'status', 'scheduledDate', 'sentDate', 'createdAt', 'updatedAt'];
        filename = 'campaigns_export.csv';
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }
    
    // Convert data to CSV
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(data);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    
    // Send CSV data
    res.status(200).send(csv);
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to generate revenue chart data
const generateRevenueChartData = async (timeRange = 'month') => {
  try {
    const { startDate, endDate, interval, format } = getDateRangeFromTimeRange(timeRange);
    
    // Create an array of dates for the x-axis
    const labels = [];
    const data = [];
    
    // Initialize data array with zeros
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      labels.push(moment(currentDate).format(format));
      data.push(0);
      
      // Increment date based on interval
      if (interval === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (interval === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Get orders within date range
    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Aggregate revenue by date
    orders.forEach(order => {
      const orderDate = moment(order.createdAt).format(format);
      const index = labels.indexOf(orderDate);
      
      if (index !== -1) {
        data[index] += order.totalAmount || 0;
      }
    });
    
    return { labels, data };
  } catch (error) {
    console.error('Error generating revenue chart data:', error);
    throw error;
  }
};

// Helper function to generate customer chart data
const generateCustomerChartData = async (timeRange = 'month') => {
  try {
    const { startDate, endDate, interval, format } = getDateRangeFromTimeRange(timeRange);
    
    // Create an array of dates for the x-axis
    const labels = [];
    const data = [];
    
    // Initialize data array with zeros
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      labels.push(moment(currentDate).format(format));
      data.push(0);
      
      // Increment date based on interval
      if (interval === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (interval === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Get customers within date range
    const customers = await Customer.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Aggregate customers by date
    customers.forEach(customer => {
      const customerDate = moment(customer.createdAt).format(format);
      const index = labels.indexOf(customerDate);
      
      if (index !== -1) {
        data[index] += 1;
      }
    });
    
    return { labels, data };
  } catch (error) {
    console.error('Error generating customer chart data:', error);
    throw error;
  }
};

// Helper function to generate leads chart data
const generateLeadsChartData = async (timeRange = 'month') => {
  try {
    const { startDate, endDate, interval, format } = getDateRangeFromTimeRange(timeRange);
    
    // Create an array of dates for the x-axis
    const labels = [];
    const data = [];
    
    // Initialize data array with zeros
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      labels.push(moment(currentDate).format(format));
      data.push(0);
      
      // Increment date based on interval
      if (interval === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (interval === 'week') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (interval === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      }
    }
    
    // Get leads within date range
    const leads = await Lead.find({
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    // Aggregate leads by date
    leads.forEach(lead => {
      const leadDate = moment(lead.createdAt).format(format);
      const index = labels.indexOf(leadDate);
      
      if (index !== -1) {
        data[index] += 1;
      }
    });
    
    return { labels, data };
  } catch (error) {
    console.error('Error generating leads chart data:', error);
    throw error;
  }
};

// Helper function to get date range from time range
const getDateRangeFromTimeRange = (timeRange) => {
  const currentDate = new Date();
  let startDate, endDate, interval, format;
  
  switch (timeRange) {
    case 'week':
      // Last 7 days
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 7);
      endDate = new Date(currentDate);
      interval = 'day';
      format = 'ddd'; // Mon, Tue, etc.
      break;
      
    case 'month':
      // Last 30 days
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date(currentDate);
      interval = 'day';
      format = 'MMM D'; // Jan 1, Jan 2, etc.
      break;
      
    case 'quarter':
      // Last 3 months
      startDate = new Date(currentDate);
      startDate.setMonth(startDate.getMonth() - 3);
      endDate = new Date(currentDate);
      interval = 'week';
      format = 'MMM D'; // Jan 1, Jan 8, etc.
      break;
      
    case 'year':
      // Last 12 months
      startDate = new Date(currentDate);
      startDate.setFullYear(startDate.getFullYear() - 1);
      endDate = new Date(currentDate);
      interval = 'month';
      format = 'MMM YYYY'; // Jan 2023, Feb 2023, etc.
      break;
      
    default:
      // Default to month
      startDate = new Date(currentDate);
      startDate.setDate(startDate.getDate() - 30);
      endDate = new Date(currentDate);
      interval = 'day';
      format = 'MMM D';
  }
  
  // Set start date to beginning of day and end date to end of day
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  
  return { startDate, endDate, interval, format };
};

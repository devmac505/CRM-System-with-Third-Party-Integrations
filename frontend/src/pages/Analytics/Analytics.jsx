import { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaUserTie, 
  FaShoppingCart, 
  FaEnvelope, 
  FaChartLine, 
  FaCalendarAlt,
  FaFilter,
  FaDownload
} from 'react-icons/fa';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  BarElement,
  ArcElement,
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import { getCustomers } from '../../api/customerService';
import { getLeads } from '../../api/leadService';
import { getOrders } from '../../api/orderService';
import { getCampaigns } from '../../api/campaignService';
import { formatCurrency } from '../../utils/formatCurrency';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('month'); // 'week', 'month', 'quarter', 'year'
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    customers: { count: 0, growth: 0 },
    leads: { count: 0, growth: 0, conversionRate: 0 },
    orders: { count: 0, total: 0, growth: 0, averageValue: 0 },
    campaigns: { count: 0, engagement: 0 }
  });
  
  // Sample data for charts - in a real app, this would come from the API
  const [chartData, setChartData] = useState({
    revenue: {
      labels: [],
      datasets: []
    },
    customers: {
      labels: [],
      datasets: []
    },
    leadSources: {
      labels: [],
      datasets: []
    },
    salesByProduct: {
      labels: [],
      datasets: []
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch all required data
        const [customersData, leadsData, ordersData, campaignsData] = await Promise.all([
          getCustomers(),
          getLeads(),
          getOrders(),
          getCampaigns()
        ]);

        // Process customers data
        const customerCount = customersData.count || 0;
        
        // Process leads data
        const leadCount = leadsData.count || 0;
        const conversionRate = leadCount > 0 ? 
          ((leadsData.data?.filter(lead => lead.status === 'converted').length || 0) / leadCount) * 100 : 0;
        
        // Process orders data
        const orderCount = ordersData.count || 0;
        const totalRevenue = ordersData.data?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;
        const averageOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        // Process campaigns data
        const campaignCount = campaignsData.count || 0;
        const campaignEngagement = campaignsData.data?.reduce((sum, campaign) => {
          const metrics = campaign.metrics || {};
          return sum + (metrics.opened || 0);
        }, 0) || 0;
        
        // Update stats
        setStats({
          customers: { 
            count: customerCount, 
            growth: 12 // Sample growth percentage - would be calculated from historical data
          },
          leads: { 
            count: leadCount, 
            growth: 8, 
            conversionRate 
          },
          orders: { 
            count: orderCount, 
            total: totalRevenue, 
            growth: 15, 
            averageValue: averageOrderValue 
          },
          campaigns: { 
            count: campaignCount, 
            engagement: campaignEngagement 
          }
        });

        // Generate chart data based on the time range
        generateChartData(timeRange, ordersData.data, customersData.data, leadsData.data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [timeRange]);

  // Generate chart data based on the selected time range
  const generateChartData = (range, orders = [], customers = [], leads = []) => {
    // Sample data generation - in a real app, this would process actual data
    let labels = [];
    let revenueData = [];
    let customerData = [];
    
    // Generate labels based on time range
    if (range === 'week') {
      labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      revenueData = [1200, 1900, 1500, 2100, 2400, 1800, 2800];
      customerData = [5, 8, 6, 9, 12, 8, 15];
    } else if (range === 'month') {
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
      revenueData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000) + 1000);
      customerData = Array.from({ length: 30 }, () => Math.floor(Math.random() * 10) + 1);
    } else if (range === 'quarter') {
      labels = ['Jan', 'Feb', 'Mar'];
      revenueData = [35000, 42000, 38000];
      customerData = [120, 150, 135];
    } else if (range === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      revenueData = [
        28000, 32000, 36000, 30000, 34000, 38000, 
        42000, 46000, 40000, 44000, 48000, 52000
      ];
      customerData = [
        80, 95, 110, 90, 105, 120, 
        135, 150, 125, 140, 155, 170
      ];
    }

    // Lead sources data for pie chart
    const leadSourcesLabels = ['Website', 'Referral', 'Social Media', 'Email', 'Other'];
    const leadSourcesData = [35, 25, 20, 15, 5];

    // Sales by product data for bar chart
    const productLabels = ['Product A', 'Product B', 'Product C', 'Product D', 'Product E'];
    const salesByProductData = [12500, 9800, 14200, 8600, 11300];

    setChartData({
      revenue: {
        labels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueData,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      customers: {
        labels,
        datasets: [
          {
            label: 'New Customers',
            data: customerData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.4,
            fill: true
          }
        ]
      },
      leadSources: {
        labels: leadSourcesLabels,
        datasets: [
          {
            label: 'Lead Sources',
            data: leadSourcesData,
            backgroundColor: [
              'rgba(59, 130, 246, 0.8)',
              'rgba(16, 185, 129, 0.8)',
              'rgba(139, 92, 246, 0.8)',
              'rgba(245, 158, 11, 0.8)',
              'rgba(239, 68, 68, 0.8)'
            ],
            borderWidth: 1
          }
        ]
      },
      salesByProduct: {
        labels: productLabels,
        datasets: [
          {
            label: 'Sales Amount',
            data: salesByProductData,
            backgroundColor: 'rgba(139, 92, 246, 0.8)',
            borderColor: 'rgba(139, 92, 246, 1)',
            borderWidth: 1
          }
        ]
      }
    });
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${percentage}% (${value})`;
          }
        }
      }
    }
  };

  // Stat card component
  const StatCard = ({ title, value, subtitle, icon, color, trend, trendValue }) => (
    <Card className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">{value}</p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-sm text-gray-500">{subtitle}</p>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trendValue >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trendValue >= 0 ? '+' : ''}{trendValue}%
            </span>
          )}
        </div>
      </div>
    </Card>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
        <div className="flex space-x-2">
          <div className="relative">
            <Button 
              variant="secondary"
              className="flex items-center"
            >
              <FaFilter className="mr-2" />
              <span>Filter</span>
            </Button>
          </div>
          <Button 
            variant="secondary"
            className="flex items-center"
          >
            <FaDownload className="mr-2" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <div className="mb-6 bg-white p-4 rounded-lg shadow flex flex-wrap gap-2">
        <Button 
          variant={timeRange === 'week' ? 'primary' : 'secondary'} 
          onClick={() => handleTimeRangeChange('week')}
        >
          This Week
        </Button>
        <Button 
          variant={timeRange === 'month' ? 'primary' : 'secondary'} 
          onClick={() => handleTimeRangeChange('month')}
        >
          This Month
        </Button>
        <Button 
          variant={timeRange === 'quarter' ? 'primary' : 'secondary'} 
          onClick={() => handleTimeRangeChange('quarter')}
        >
          This Quarter
        </Button>
        <Button 
          variant={timeRange === 'year' ? 'primary' : 'secondary'} 
          onClick={() => handleTimeRangeChange('year')}
        >
          This Year
        </Button>
      </div>

      <div className="stats-grid mb-6">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(stats.orders.total)}
          subtitle={`${stats.orders.count} orders`}
          icon={<FaChartLine size={28} />}
          color="stat-icon-revenue"
          trend={true}
          trendValue={stats.orders.growth}
        />
        <StatCard
          title="Customers"
          value={stats.customers.count}
          subtitle="Total customers"
          icon={<FaUsers size={28} />}
          color="stat-icon-customers"
          trend={true}
          trendValue={stats.customers.growth}
        />
        <StatCard
          title="Lead Conversion"
          value={`${stats.leads.conversionRate.toFixed(1)}%`}
          subtitle={`${stats.leads.count} total leads`}
          icon={<FaUserTie size={28} />}
          color="stat-icon-leads"
          trend={true}
          trendValue={stats.leads.growth}
        />
        <StatCard
          title="Avg. Order Value"
          value={formatCurrency(stats.orders.averageValue)}
          subtitle="Per transaction"
          icon={<FaShoppingCart size={28} />}
          color="stat-icon-orders"
          trend={false}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue Trends">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <Line data={chartData.revenue} options={lineChartOptions} />
            )}
          </div>
        </Card>
        <Card title="Customer Growth">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <Line data={chartData.customers} options={lineChartOptions} />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Lead Sources">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <Doughnut data={chartData.leadSources} options={pieChartOptions} />
            )}
          </div>
        </Card>
        <Card title="Sales by Product">
          <div className="h-80">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading chart data...</p>
              </div>
            ) : (
              <Bar data={chartData.salesByProduct} options={barChartOptions} />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card title="Sales Performance">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Growth
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Product A</td>
                  <td className="px-6 py-4 whitespace-nowrap">125</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(12500)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      +12.5%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Product B</td>
                  <td className="px-6 py-4 whitespace-nowrap">98</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(9800)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      +8.3%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Product C</td>
                  <td className="px-6 py-4 whitespace-nowrap">142</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(14200)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      +15.2%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Product D</td>
                  <td className="px-6 py-4 whitespace-nowrap">86</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(8600)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      -3.4%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">Product E</td>
                  <td className="px-6 py-4 whitespace-nowrap">113</td>
                  <td className="px-6 py-4 whitespace-nowrap">{formatCurrency(11300)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      +10.8%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics;

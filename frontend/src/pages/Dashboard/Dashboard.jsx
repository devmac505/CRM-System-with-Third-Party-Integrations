import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FaUsers,
  FaUserTie,
  FaShoppingCart,
  FaEnvelope,
  FaChartLine,
  FaCalendarAlt,
  FaCheckCircle,
  FaExclamationTriangle,
  FaBell,
  FaTasks,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import Card from '../../components/UI/Card';
import { getCustomers } from '../../api/customerService';
import { getLeads } from '../../api/leadService';
import { getOrders } from '../../api/orderService';
import { getCampaigns } from '../../api/campaignService';
import { getDashboardSummary } from '../../api/analyticsService';
import { formatCurrency } from '../../utils/formatCurrency';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: { count: 0, growth: 0, loading: true },
    leads: { count: 0, growth: 0, loading: true },
    orders: { count: 0, total: 0, growth: 0, loading: true },
    campaigns: { count: 0, loading: true }
  });

  const [chartData, setChartData] = useState({
    revenueChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'Revenue',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    },
    leadsChart: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      datasets: [
        {
          label: 'New Leads',
          data: [0, 0, 0, 0, 0, 0],
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          tension: 0.4,
          fill: true
        }
      ]
    }
  });

  const [recentActivities] = useState([
    { id: 1, type: 'customer', action: 'New customer added', name: 'John Smith', time: '2 hours ago' },
    { id: 2, type: 'lead', action: 'Lead status updated', name: 'Sarah Johnson', time: '3 hours ago' },
    { id: 3, type: 'order', action: 'New order placed', name: 'Order #1234', time: '5 hours ago' },
    { id: 4, type: 'campaign', action: 'Campaign launched', name: 'Summer Sale', time: '1 day ago' },
    { id: 5, type: 'customer', action: 'Customer updated', name: 'Michael Brown', time: '1 day ago' },
  ]);

  const [tasks] = useState([
    { id: 1, title: 'Follow up with new leads', priority: 'high', dueDate: 'Today' },
    { id: 2, title: 'Prepare monthly sales report', priority: 'medium', dueDate: 'Tomorrow' },
    { id: 3, title: 'Update customer database', priority: 'low', dueDate: 'Next week' },
    { id: 4, title: 'Plan new marketing campaign', priority: 'medium', dueDate: '3 days' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all required data in parallel
        const [customersData, leadsData, ordersData, campaignsData, dashboardSummary] = await Promise.all([
          getCustomers(),
          getLeads(),
          getOrders(),
          getCampaigns(),
          getDashboardSummary().catch(() => null) // Optional data, don't fail if not available
        ]);

        // Process customers data
        const customerCount = customersData.count || 0;

        // Process leads data
        const leadCount = leadsData.count || 0;

        // Process orders data
        const orderCount = ordersData.count || 0;
        const totalRevenue = ordersData.data?.reduce((sum, order) => sum + (order.totalAmount || 0), 0) || 0;

        // Process campaigns data
        const campaignCount = campaignsData.count || 0;

        // Update stats with growth data from dashboard summary if available
        setStats({
          customers: {
            count: customerCount,
            growth: dashboardSummary?.customerGrowth || 5, // Default value if API not available
            loading: false
          },
          leads: {
            count: leadCount,
            growth: dashboardSummary?.leadGrowth || 8, // Default value if API not available
            loading: false
          },
          orders: {
            count: orderCount,
            total: totalRevenue,
            growth: dashboardSummary?.revenueGrowth || 12, // Default value if API not available
            loading: false
          },
          campaigns: {
            count: campaignCount,
            loading: false
          }
        });

        // Update chart data if dashboard summary is available
        if (dashboardSummary) {
          setChartData({
            revenueChart: {
              labels: dashboardSummary.revenueChart?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Revenue',
                  data: dashboardSummary.revenueChart?.data || [3000, 4500, 3800, 5200, 4800, 6000],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            },
            leadsChart: {
              labels: dashboardSummary.leadsChart?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'New Leads',
                  data: dashboardSummary.leadsChart?.data || [25, 38, 32, 45, 40, 52],
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            }
          });
        } else {
          // Use sample data if API not available
          setChartData({
            revenueChart: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'Revenue',
                  data: [3000, 4500, 3800, 5200, 4800, 6000],
                  borderColor: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            },
            leadsChart: {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
              datasets: [
                {
                  label: 'New Leads',
                  data: [25, 38, 32, 45, 40, 52],
                  borderColor: '#10b981',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  tension: 0.4,
                  fill: true
                }
              ]
            }
          });
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        // Set loading to false even if there's an error
        setStats(prev => ({
          ...prev,
          customers: { ...prev.customers, loading: false },
          leads: { ...prev.leads, loading: false },
          orders: { ...prev.orders, loading: false },
          campaigns: { ...prev.campaigns, loading: false }
        }));
      }
    };

    fetchData();
  }, []);

  // Helper functions for activity icons
  const getActivityIcon = (type) => {
    switch (type) {
      case 'customer':
        return <FaUsers />;
      case 'lead':
        return <FaUserTie />;
      case 'order':
        return <FaShoppingCart />;
      case 'campaign':
        return <FaEnvelope />;
      default:
        return <FaBell />;
    }
  };

  const getActivityIconClass = (type) => {
    switch (type) {
      case 'customer':
        return 'activity-icon-customer';
      case 'lead':
        return 'activity-icon-lead';
      case 'order':
        return 'activity-icon-order';
      case 'campaign':
        return 'activity-icon-campaign';
      default:
        return 'activity-icon-default';
    }
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          drawBorder: false,
        }
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        }
      }
    },
    elements: {
      line: {
        tension: 0.4
      },
      point: {
        radius: 2,
        hoverRadius: 4
      }
    }
  };

  const StatCard = ({ title, value, icon, loading, link, color, trend, trendValue }) => (
    <Card className="stat-card">
      <div className={`stat-icon ${color}`}>
        {icon}
      </div>
      <div className="stat-content">
        <h3 className="stat-title">{title}</h3>
        <p className="stat-value">
          {loading ? (
            <span className="text-gray-400">Loading...</span>
          ) : (
            value
          )}
        </p>
        <div className="flex items-center justify-between mt-1">
          {trend && trendValue !== undefined && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full flex items-center ${
              trendValue >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {trendValue >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
              {Math.abs(trendValue)}%
            </span>
          )}
          <Link to={link} className="form-link inline-flex items-center ml-auto">
            View details
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </Link>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to your Dashboard</h1>
        <p className="dashboard-subtitle">Here's an overview of your CRM system</p>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Total Customers"
          value={stats.customers.count}
          icon={<FaUsers size={28} />}
          loading={stats.customers.loading}
          link="/customers"
          color="stat-icon-customers"
          trend={true}
          trendValue={stats.customers.growth}
        />
        <StatCard
          title="Active Leads"
          value={stats.leads.count}
          icon={<FaUserTie size={28} />}
          loading={stats.leads.loading}
          link="/leads"
          color="stat-icon-leads"
          trend={true}
          trendValue={stats.leads.growth}
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.count}
          icon={<FaShoppingCart size={28} />}
          loading={stats.orders.loading}
          link="/orders"
          color="stat-icon-orders"
          trend={true}
          trendValue={stats.orders.growth}
        />
        <StatCard
          title="Campaigns"
          value={stats.campaigns.count}
          icon={<FaEnvelope size={28} />}
          loading={stats.campaigns.loading}
          link="/campaigns"
          color="stat-icon-revenue"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Revenue Overview">
          <div className="h-64">
            {stats.orders.loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading revenue data...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {formatCurrency(stats.orders.total)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Total Revenue
                    </p>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full flex items-center ${
                    stats.orders.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.orders.growth >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {Math.abs(stats.orders.growth)}%
                  </div>
                </div>
                <div className="h-48">
                  <Line data={chartData.revenueChart} options={chartOptions} />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 gap-3">
            <Link
              to="/customers/new"
              className="quick-action-link"
            >
              <div className="quick-action-icon bg-blue-500">
                <FaUsers />
              </div>
              <span className="quick-action-text">Add New Customer</span>
            </Link>
            <Link
              to="/leads/new"
              className="quick-action-link"
            >
              <div className="quick-action-icon bg-green-500">
                <FaUserTie />
              </div>
              <span className="quick-action-text">Create New Lead</span>
            </Link>
            <Link
              to="/orders/new"
              className="quick-action-link"
            >
              <div className="quick-action-icon bg-purple-500">
                <FaShoppingCart />
              </div>
              <span className="quick-action-text">Create New Order</span>
            </Link>
            <Link
              to="/campaigns/new"
              className="quick-action-link"
            >
              <div className="quick-action-icon bg-yellow-500">
                <FaEnvelope />
              </div>
              <span className="quick-action-text">Create New Campaign</span>
            </Link>
            <Link
              to="/analytics"
              className="quick-action-link"
            >
              <div className="quick-action-icon bg-red-500">
                <FaChartLine />
              </div>
              <span className="quick-action-text">View Analytics</span>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card title="Lead Conversion" headerClassName="border-l-4 border-green-500">
          <div className="h-64">
            {stats.leads.loading ? (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Loading lead data...</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {stats.leads.count} Leads
                    </h3>
                    <p className="text-sm text-gray-500">
                      Active in pipeline
                    </p>
                  </div>
                  <div className={`text-sm font-medium px-2 py-1 rounded-full flex items-center ${
                    stats.leads.growth >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {stats.leads.growth >= 0 ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                    {Math.abs(stats.leads.growth)}%
                  </div>
                </div>
                <div className="h-48">
                  <Line data={chartData.leadsChart} options={chartOptions} />
                </div>
              </>
            )}
          </div>
        </Card>

        <Card title="Sales Pipeline Summary" headerClassName="border-l-4 border-purple-500">
          <div className="h-64 overflow-hidden">
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Qualified Leads</h4>
                    <p className="text-xl font-semibold text-gray-900">24</p>
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <FaArrowUp className="mr-1" /> 12% from last month
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Proposals</h4>
                    <p className="text-xl font-semibold text-gray-900">18</p>
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <FaArrowUp className="mr-1" /> 8% from last month
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Negotiations</h4>
                    <p className="text-xl font-semibold text-gray-900">12</p>
                    <div className="mt-2 text-xs text-red-600 flex items-center">
                      <FaArrowDown className="mr-1" /> 5% from last month
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Closed Won</h4>
                    <p className="text-xl font-semibold text-gray-900">8</p>
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <FaArrowUp className="mr-1" /> 15% from last month
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-center">
                <Link to="/leads/pipeline" className="form-link inline-flex items-center">
                  View full pipeline
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Recent Activities" headerClassName="border-l-4 border-blue-500">
          <div className="divide-y">
            {recentActivities.map(activity => (
              <div key={activity.id} className="py-3 flex items-start">
                <div className={`activity-icon ${getActivityIconClass(activity.type)}`}>
                  {getActivityIcon(activity.type)}
                </div>
                <div className="ml-3">
                  <p className="font-medium text-gray-900">{activity.action}</p>
                  <p className="text-sm text-gray-500">{activity.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/activities" className="form-link inline-flex items-center">
              View all activities
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </Card>

        <Card title="Upcoming Tasks" headerClassName="border-l-4 border-yellow-500">
          <div className="divide-y">
            {tasks.map(task => (
              <div key={task.id} className="py-3 flex items-center justify-between">
                <div className="flex items-start">
                  <div className={`task-priority-indicator priority-${task.priority}`}></div>
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{task.title}</p>
                    <p className="text-xs text-gray-400 mt-1">Due: {task.dueDate}</p>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <FaCheckCircle size={18} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <Link to="/tasks" className="form-link inline-flex items-center">
              View all tasks
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;

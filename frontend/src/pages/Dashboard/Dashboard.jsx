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
  FaTasks
} from 'react-icons/fa';
import Card from '../../components/UI/Card';
import { getCustomers } from '../../api/customerService';
import { getLeads } from '../../api/leadService';
import { getOrders } from '../../api/orderService';
import { getCampaigns } from '../../api/campaignService';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const [stats, setStats] = useState({
    customers: { count: 0, loading: true },
    leads: { count: 0, loading: true },
    orders: { count: 0, total: 0, loading: true },
    campaigns: { count: 0, loading: true }
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
        // Fetch customers
        const customersData = await getCustomers();
        setStats(prev => ({
          ...prev,
          customers: {
            count: customersData.count || 0,
            loading: false
          }
        }));

        // Fetch leads
        const leadsData = await getLeads();
        setStats(prev => ({
          ...prev,
          leads: {
            count: leadsData.count || 0,
            loading: false
          }
        }));

        // Fetch orders
        const ordersData = await getOrders();
        const totalRevenue = ordersData.data?.reduce((sum, order) => sum + order.totalAmount, 0) || 0;
        setStats(prev => ({
          ...prev,
          orders: {
            count: ordersData.count || 0,
            total: totalRevenue,
            loading: false
          }
        }));

        // Fetch campaigns
        const campaignsData = await getCampaigns();
        setStats(prev => ({
          ...prev,
          campaigns: {
            count: campaignsData.count || 0,
            loading: false
          }
        }));
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

  const StatCard = ({ title, value, icon, loading, link, color }) => (
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
        <Link to={link} className="form-link inline-flex items-center">
          View details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Link>
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
        />
        <StatCard
          title="Active Leads"
          value={stats.leads.count}
          icon={<FaUserTie size={28} />}
          loading={stats.leads.loading}
          link="/leads"
          color="stat-icon-leads"
        />
        <StatCard
          title="Total Orders"
          value={stats.orders.count}
          icon={<FaShoppingCart size={28} />}
          loading={stats.orders.loading}
          link="/orders"
          color="stat-icon-orders"
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
          <div className="flex items-center justify-center h-full">
            {stats.orders.loading ? (
              <p className="text-gray-500">Loading revenue data...</p>
            ) : (
              <div className="text-center">
                <div className="stat-icon stat-icon-revenue mb-4 mx-auto">
                  <FaChartLine />
                </div>
                <h3 className="stat-title">Total Revenue</h3>
                <p className="stat-value mb-2">
                  {formatCurrency(stats.orders.total)}
                </p>
                <p className="text-sm text-gray-500 mt-2 bg-gray-100 px-3 py-1 rounded-full inline-block">
                  From {stats.orders.count} orders
                </p>
              </div>
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

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FaHome,
  FaUsers,
  FaUserTie,
  FaShoppingCart,
  FaEnvelope,
  FaChartLine,
  FaAngleRight,
  FaAngleDown,
  FaBars
} from 'react-icons/fa';
import logo from '../../assets/logo.svg';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    customers: false,
    leads: false,
    orders: false,
    campaigns: false
  });

  // Close expanded menus when sidebar is collapsed
  useEffect(() => {
    if (collapsed) {
      setExpandedMenus({
        customers: false,
        leads: false,
        orders: false,
        campaigns: false
      });
    }
  }, [collapsed]);

  const toggleMenu = (menu) => {
    setExpandedMenus({
      ...expandedMenus,
      [menu]: !expandedMenus[menu]
    });
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isActiveSection = (section) => {
    return location.pathname.includes(section);
  };

  return (
    <div className={`sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <img src={logo} alt="CRM Logo" className="sidebar-logo" />}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {collapsed ? <FaAngleRight /> : <FaBars />}
        </button>
      </div>

      <ul className="sidebar-menu">
        <li className="sidebar-menu-item">
          <Link
            to="/dashboard"
            className={`sidebar-menu-link ${isActive('/dashboard') ? 'active' : ''}`}
          >
            <FaHome className="sidebar-menu-icon" />
            {!collapsed && <span>Dashboard</span>}
          </Link>
        </li>

        <li className="sidebar-menu-item">
          <div
            className={`sidebar-menu-link ${isActiveSection('/customers') ? 'active' : ''}`}
            onClick={() => !collapsed && toggleMenu('customers')}
          >
            <div className="flex items-center">
              <FaUsers className="sidebar-menu-icon" />
              {!collapsed && <span>Customers</span>}
            </div>
            {!collapsed && (
              <FaAngleDown
                className={`transform transition-transform ${
                  expandedMenus.customers ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
          {!collapsed && expandedMenus.customers && (
            <ul className="pl-6 mt-2 space-y-1">
              <li>
                <Link
                  to="/customers"
                  className={`sidebar-menu-link ${isActive('/customers') ? 'active' : ''}`}
                >
                  All Customers
                </Link>
              </li>
              <li>
                <Link
                  to="/customers/new"
                  className={`sidebar-menu-link ${isActive('/customers/new') ? 'active' : ''}`}
                >
                  Add Customer
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="sidebar-menu-item">
          <div
            className={`sidebar-menu-link ${isActiveSection('/leads') ? 'active' : ''}`}
            onClick={() => !collapsed && toggleMenu('leads')}
          >
            <div className="flex items-center">
              <FaUserTie className="sidebar-menu-icon" />
              {!collapsed && <span>Leads</span>}
            </div>
            {!collapsed && (
              <FaAngleDown
                className={`transform transition-transform ${
                  expandedMenus.leads ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
          {!collapsed && expandedMenus.leads && (
            <ul className="pl-6 mt-2 space-y-1">
              <li>
                <Link
                  to="/leads"
                  className={`sidebar-menu-link ${isActive('/leads') ? 'active' : ''}`}
                >
                  All Leads
                </Link>
              </li>
              <li>
                <Link
                  to="/leads/new"
                  className={`sidebar-menu-link ${isActive('/leads/new') ? 'active' : ''}`}
                >
                  Add Lead
                </Link>
              </li>
              <li>
                <Link
                  to="/leads/pipeline"
                  className={`sidebar-menu-link ${isActive('/leads/pipeline') ? 'active' : ''}`}
                >
                  Sales Pipeline
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="sidebar-menu-item">
          <div
            className={`sidebar-menu-link ${isActiveSection('/orders') ? 'active' : ''}`}
            onClick={() => !collapsed && toggleMenu('orders')}
          >
            <div className="flex items-center">
              <FaShoppingCart className="sidebar-menu-icon" />
              {!collapsed && <span>Orders</span>}
            </div>
            {!collapsed && (
              <FaAngleDown
                className={`transform transition-transform ${
                  expandedMenus.orders ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
          {!collapsed && expandedMenus.orders && (
            <ul className="pl-6 mt-2 space-y-1">
              <li>
                <Link
                  to="/orders"
                  className={`sidebar-menu-link ${isActive('/orders') ? 'active' : ''}`}
                >
                  All Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/orders/new"
                  className={`sidebar-menu-link ${isActive('/orders/new') ? 'active' : ''}`}
                >
                  Create Order
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="sidebar-menu-item">
          <div
            className={`sidebar-menu-link ${isActiveSection('/campaigns') ? 'active' : ''}`}
            onClick={() => !collapsed && toggleMenu('campaigns')}
          >
            <div className="flex items-center">
              <FaEnvelope className="sidebar-menu-icon" />
              {!collapsed && <span>Campaigns</span>}
            </div>
            {!collapsed && (
              <FaAngleDown
                className={`transform transition-transform ${
                  expandedMenus.campaigns ? 'rotate-180' : ''
                }`}
              />
            )}
          </div>
          {!collapsed && expandedMenus.campaigns && (
            <ul className="pl-6 mt-2 space-y-1">
              <li>
                <Link
                  to="/campaigns"
                  className={`sidebar-menu-link ${isActive('/campaigns') ? 'active' : ''}`}
                >
                  All Campaigns
                </Link>
              </li>
              <li>
                <Link
                  to="/campaigns/new"
                  className={`sidebar-menu-link ${isActive('/campaigns/new') ? 'active' : ''}`}
                >
                  Create Campaign
                </Link>
              </li>
            </ul>
          )}
        </li>

        <li className="sidebar-menu-item">
          <Link
            to="/analytics"
            className={`sidebar-menu-link ${isActive('/analytics') ? 'active' : ''}`}
          >
            <FaChartLine className="sidebar-menu-icon" />
            {!collapsed && <span>Analytics</span>}
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaBell,
  FaCog,
  FaSearch
} from 'react-icons/fa';
import logo from '../../assets/logo.svg';

const Navbar = ({ toggleSidebar }) => {
  const { user, logoutUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Example notification count

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="navbar-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>

        <Link to="/" className="navbar-brand">
          <img src={logo} alt="CRM System Logo" className="h-8" />
        </Link>

        <div className="navbar-search">
          <FaSearch className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search..."
          />
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="navbar-right">
        {isAuthenticated ? (
          <>
            <button className="navbar-icon-button">
              <FaBell />
              {notifications > 0 && (
                <span className="navbar-notification-badge">{notifications}</span>
              )}
            </button>

            <button className="navbar-icon-button">
              <FaCog />
            </button>

            <div className="navbar-user">
              <div className="navbar-user-avatar">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="navbar-user-info">
                <div className="navbar-user-name">{user?.name || 'User'}</div>
                <div className="navbar-user-role">Administrator</div>
              </div>

              <div className="navbar-user-menu">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="text-sm font-medium text-gray-800">{user?.email || 'user@example.com'}</p>
                </div>
                <Link
                  to="/profile"
                  className="navbar-user-menu-item"
                >
                  <FaUserCircle className="navbar-user-menu-icon" />
                  Your Profile
                </Link>
                <Link
                  to="/settings"
                  className="navbar-user-menu-item"
                >
                  <FaCog className="navbar-user-menu-icon" />
                  Settings
                </Link>
                <div className="border-t border-gray-100 my-1"></div>
                <button
                  onClick={handleLogout}
                  className="navbar-user-menu-item w-full text-left"
                >
                  <FaSignOutAlt className="navbar-user-menu-icon" />
                  Sign out
                </button>
              </div>
            </div>
            </>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="form-link text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
                style={{ width: 'auto' }}
              >
                Register
              </Link>
            </div>
          )}
        </div>

      {/* Mobile menu button */}
      <button
        className="md:hidden navbar-toggle"
        onClick={toggleMenu}
      >
        {isMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated ? (
            <div className="mobile-menu-items">
              <Link
                to="/dashboard"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaHome className="mobile-menu-icon" />
                Dashboard
              </Link>
              <Link
                to="/customers"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaUsers className="mobile-menu-icon" />
                Customers
              </Link>
              <Link
                to="/leads"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaUserTie className="mobile-menu-icon" />
                Leads
              </Link>
              <Link
                to="/orders"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaShoppingCart className="mobile-menu-icon" />
                Orders
              </Link>
              <Link
                to="/campaigns"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaEnvelope className="mobile-menu-icon" />
                Campaigns
              </Link>
              <Link
                to="/profile"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaUserCircle className="mobile-menu-icon" />
                Profile
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  toggleMenu();
                }}
                className="mobile-menu-item text-left w-full"
              >
                <FaSignOutAlt className="mobile-menu-icon" />
                Logout
              </button>
            </div>
          ) : (
            <div className="mobile-menu-items">
              <Link
                to="/login"
                className="mobile-menu-item"
                onClick={toggleMenu}
              >
                <FaUserCircle className="mobile-menu-icon" />
                Login
              </Link>
              <Link
                to="/register"
                className="mobile-menu-item highlight"
                onClick={toggleMenu}
              >
                <FaUserCircle className="mobile-menu-icon" />
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

import { Link, useLocation } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import '../components/style/Sidebar.css';

const Sidebar = () => {
  const location = useLocation();

  let role = null;
  const token = localStorage.getItem('token');
  if (token) {
    try {
      const decoded = jwt_decode(token);
      role = decoded.role;
    } catch (e) {
      console.error('Invalid token', e);
    }
  }

  const menuItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Inventory', path: '/inventory' },
    ...(role === 'admin' ? [{ name: 'Admin Panel', path: '/admin-panel' }] : []),
    ...(role === 'admin' || role === 'staff' ? [{ name: 'Transaction', path: '/transaction' }] : []),
    { name: 'Customer Service', path: '/customer-service' },
  ];

  return (
    <nav className="sidebar">
      <h2 className="sidebar-title">
        Warehouse<br />Electronic
      </h2>

      <ul className="sidebar-menu">
        {menuItems.map(({ name, path }) => {
          const isActive = location.pathname === path;
          return (
            <li key={path}>
              <Link
                to={path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {name}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="sidebar-footer">
        &copy; 2025 Warehouse App
      </div>
    </nav>
  );
};

export default Sidebar;

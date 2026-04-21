import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const navLinks = {
  student: [
    { to: '/shops', label: 'Shops' },
    { to: '/orders', label: 'My Orders' },
  ],
  vendor: [
    { to: '/vendor', label: 'Dashboard' },
    { to: '/vendor/menu', label: 'Menu' },
    { to: '/vendor/incoming', label: 'Incoming' },
    { to: '/vendor/queue', label: 'Order Queue' },
  ],
  delivery: [
    { to: '/delivery', label: 'Dashboard' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/shops', label: 'Shops' },
    { to: '/admin/users', label: 'Users' },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = user ? navLinks[user.role] || [] : [];

  return (
    <nav className="bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-xl tracking-tight flex items-center gap-2">
          🍽️ CampusEats
        </Link>
        <div className="flex items-center gap-5">
          {links.map(l => (
            <Link key={l.to} to={l.to} className="text-sm font-medium hover:text-orange-100 transition-colors">
              {l.label}
            </Link>
          ))}
          {user?.role === 'student' && (
            <Link to="/cart" className="relative text-sm font-medium hover:text-orange-100 transition-colors">
              🛒 Cart
              {count > 0 && (
                <span className="absolute -top-2 -right-3 bg-white text-orange-600 text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {count}
                </span>
              )}
            </Link>
          )}
          {user && (
            <div className="flex items-center gap-3 ml-1 border-l border-orange-400 pl-4">
              <span className="text-xs text-orange-100 font-medium">{user.name}</span>
              <button
                onClick={handleLogout}
                className="text-xs bg-white text-orange-600 hover:bg-orange-50 font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

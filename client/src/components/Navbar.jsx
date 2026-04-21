import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  UtensilsCrossed, ShoppingCart, LogOut, LayoutDashboard,
  BookOpen, Bell, ListOrdered, Package, Store, Users,
  Truck, Menu, X, User,
} from 'lucide-react';
import gsap from 'gsap';

const NAV_LINKS = {
  student: [
    { to: '/shops',  label: 'Shops',     icon: Store },
    { to: '/orders', label: 'My Orders', icon: Package },
  ],
  vendor: [
    { to: '/vendor',          label: 'Dashboard',   icon: LayoutDashboard },
    { to: '/vendor/menu',     label: 'Menu',         icon: BookOpen },
    { to: '/vendor/incoming', label: 'Incoming',     icon: Bell },
    { to: '/vendor/queue',    label: 'Queue',         icon: ListOrdered },
  ],
  delivery: [
    { to: '/delivery', label: 'Dashboard', icon: Truck },
  ],
  admin: [
    { to: '/admin',        label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/shops',  label: 'Shops',     icon: Store },
    { to: '/admin/users',  label: 'Users',     icon: Users },
  ],
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const navRef = useRef(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const links = user ? NAV_LINKS[user.role] || [] : [];

  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -60, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.55, ease: 'power3.out' }
    );
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  return (
    <header
      ref={navRef}
      className="sticky top-0 z-50 bg-[hsl(var(--red-chicory))] shadow-lg"
      style={{ '--tw-shadow-color': 'hsl(345 62% 30% / 0.35)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[hsl(var(--buffalo-sauce))] shadow-inner group-hover:scale-105 transition-transform duration-200">
              <UtensilsCrossed size={18} className="text-white" strokeWidth={2.2} />
            </span>
            <span className="font-display font-bold text-xl text-white tracking-tight hidden sm:block">
              Campus<span className="text-[hsl(var(--mustard-oil))]">Eats</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right section */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart */}
            {user?.role === 'student' && (
              <Link
                to="/cart"
                className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Cart"
              >
                <ShoppingCart size={18} strokeWidth={2} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[hsl(var(--buffalo-sauce))] text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none shadow">
                    {count > 9 ? '9+' : count}
                  </span>
                )}
              </Link>
            )}

            {/* User chip */}
            {user && (
              <div className="flex items-center gap-2 pl-2 border-l border-white/20 ml-1">
                <div className="flex items-center gap-1.5 text-white/80">
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[hsl(var(--mustard-oil))/0.25] border border-[hsl(var(--mustard-oil))/0.4]">
                    <User size={13} className="text-[hsl(var(--mustard-oil))]" />
                  </span>
                  <span className="text-xs text-white/70 hidden sm:block max-w-24 truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                  title="Logout"
                >
                  <LogOut size={13} strokeWidth={2} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}

            {/* Mobile menu toggle */}
            {user && links.length > 0 && (
              <button
                onClick={() => setMobileOpen(v => !v)}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Menu"
              >
                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/15 bg-[hsl(345_55%_38%)] px-4 py-3 space-y-1 animate-fade-in">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/15 text-white' : 'text-white/75 hover:text-white hover:bg-white/10'
                }`
              }
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Store, TrendingUp, LayoutDashboard } from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import useScrollReveal from '../../hooks/useScrollReveal';

const STATUS_BADGE = {
  pending:   'badge-pending',
  accepted:  'badge-accepted',
  rejected:  'badge-rejected',
  preparing: 'badge-preparing',
  ready:     'badge-ready',
  picked_up: 'badge-picked_up',
  delivered: 'badge-delivered',
  cancelled: 'badge-cancelled',
};

function StatCard({ label, value, icon: Icon, accent }) {
  const borders = {
    sauce:   'border-t-[hsl(var(--buffalo-sauce))]',
    chicory: 'border-t-[hsl(var(--red-chicory))]',
    emerald: 'border-t-emerald-500',
    mustard: 'border-t-[hsl(var(--mustard-oil))]',
  };
  const texts = {
    sauce:   'text-[hsl(var(--buffalo-sauce))]',
    chicory: 'text-[hsl(var(--red-chicory))]',
    emerald: 'text-emerald-600',
    mustard: 'text-[hsl(var(--mustard-oil)/0.75)]',
  };
  return (
    <div className={`card p-5 border-t-4 ${borders[accent]}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={16} className="text-muted-foreground/60" strokeWidth={2} />
      </div>
      <p className={`text-2xl font-display font-bold ${texts[accent]}`}>{value}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const pageRef = useRef(null);
  const [stats, setStats]   = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/orders')])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.slice(0, 10)); })
      .finally(() => setLoading(false));
  }, []);

  useScrollReveal(pageRef);

  if (loading) return <Spinner />;

  const quickLinks = [
    { to: '/admin/shops', label: 'Manage Shops', desc: 'Approve or suspend vendor shops', icon: Store },
    { to: '/admin/users', label: 'Manage Users', desc: 'View and toggle user accounts', icon: Users },
  ];

  return (
    <div ref={pageRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

      {/* Page title */}
      <div className="flex items-center gap-3 mb-8" data-reveal>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--red-chicory)/0.1)]">
          <LayoutDashboard size={20} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[hsl(var(--red-chicory))]">Admin Dashboard</h1>
          <p className="text-muted-foreground text-xs mt-0.5">Platform overview &amp; controls</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" data-reveal>
          <StatCard label="Total Orders" value={stats.totalOrders} icon={Package} accent="sauce" />
          <StatCard label="Total Users"  value={stats.totalUsers}  icon={Users}   accent="chicory" />
          <StatCard label="Active Shops" value={stats.totalShops}  icon={Store}   accent="emerald" />
          <StatCard label="Revenue"      value={`₹${stats.revenue?.toLocaleString()}`} icon={TrendingUp} accent="mustard" />
        </div>
      )}

      {/* Quick links */}
      <p className="section-label" data-reveal>Management</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10" data-reveal>
        {quickLinks.map(({ to, label, desc, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="card p-5 flex items-start gap-4 hover:shadow-card-md hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--red-chicory)/0.08)] shrink-0 group-hover:bg-[hsl(var(--red-chicory)/0.15)] transition-colors">
              <Icon size={18} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
            </div>
            <div>
              <p className="font-semibold text-card-foreground group-hover:text-[hsl(var(--buffalo-sauce))] transition-colors">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent orders */}
      <div data-reveal>
        <p className="section-label">Recent Orders</p>
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[hsl(var(--breezy-beige))] text-muted-foreground text-xs uppercase">
                <tr>
                  {['Student', 'Shop', 'Amount', 'Status', 'Date'].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-semibold tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, i) => (
                  <tr key={o._id} className={`border-t border-border/60 hover:bg-muted/20 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3 font-medium text-card-foreground">{o.student?.name || '—'}</td>
                    <td className="px-4 py-3 text-muted-foreground">{o.shop?.name || '—'}</td>
                    <td className="px-4 py-3 font-semibold text-card-foreground">₹{o.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={STATUS_BADGE[o.status] || 'badge'}>
                        {o.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

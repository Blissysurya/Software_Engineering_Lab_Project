import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Store, MapPin, Bell, ListOrdered, BookOpen,
  TrendingUp, Clock, Star, Package, PowerOff, Power,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import useScrollReveal from '../../hooks/useScrollReveal';

function StatCard({ label, value, icon: Icon, accent }) {
  const accentMap = {
    sauce:   'border-t-[hsl(var(--buffalo-sauce))]',
    chicory: 'border-t-[hsl(var(--red-chicory))]',
    mustard: 'border-t-[hsl(var(--mustard-oil))]',
    emerald: 'border-t-emerald-500',
  };
  const textMap = {
    sauce:   'text-[hsl(var(--buffalo-sauce))]',
    chicory: 'text-[hsl(var(--red-chicory))]',
    mustard: 'text-[hsl(var(--mustard-oil)/0.8)]',
    emerald: 'text-emerald-600',
  };
  return (
    <div className={`card p-5 border-t-4 ${accentMap[accent] || accentMap.sauce}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon size={16} className="text-muted-foreground/60" strokeWidth={2} />
      </div>
      <p className={`text-2xl font-display font-bold ${textMap[accent] || textMap.sauce}`}>{value}</p>
    </div>
  );
}

export default function VendorDashboard() {
  const pageRef  = useRef(null);
  const navigate = useNavigate();
  const [shop, setShop]       = useState(null);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get('/shops/my-shop')
      .then(r => { setShop(r.data); return api.get(`/orders/shop/${r.data._id}`); })
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useScrollReveal(pageRef);

  const toggleOpen = async () => {
    setToggling(true);
    try { const { data } = await api.patch(`/shops/${shop._id}/toggle-open`); setShop(data); } catch {}
    setToggling(false);
  };

  if (loading) return <Spinner />;

  if (!shop) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mx-auto mb-6">
          <Store size={36} className="text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">No shop yet</h2>
        <p className="text-muted-foreground text-sm mb-8">Create your shop and start selling on campus.</p>
        <button onClick={() => navigate('/vendor/menu')} className="btn-primary px-6">
          Create Your Shop
        </button>
      </div>
    );
  }

  const pending = orders.filter(o => o.status === 'pending').length;
  const revenue = orders
    .filter(o => ['accepted', 'preparing', 'ready'].includes(o.status))
    .reduce((s, o) => s + o.totalAmount, 0);

  const quickLinks = [
    {
      to: '/vendor/incoming', label: 'Incoming Orders', desc: 'Accept or reject new orders',
      icon: Bell, badge: pending, accent: 'sauce',
    },
    {
      to: '/vendor/queue', label: 'Order Queue', desc: 'Mark orders as preparing / ready',
      icon: ListOrdered, accent: 'chicory',
    },
    {
      to: '/vendor/menu', label: 'Manage Menu', desc: 'Add, edit or toggle products',
      icon: BookOpen, accent: 'mustard',
    },
  ];

  return (
    <div ref={pageRef} className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

      {/* Shop header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8" data-reveal>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--red-chicory)/0.1)]">
              <Store size={20} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
            </div>
            <h1 className="font-display text-2xl font-bold text-[hsl(var(--red-chicory))]">{shop.name}</h1>
          </div>
          {shop.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1.5 ml-13 pl-0.5">
              <MapPin size={12} strokeWidth={2} />{shop.location}
            </p>
          )}
          {!shop.isApproved && (
            <span className="badge badge-pending mt-2 ml-0.5">⚠ Pending Admin Approval</span>
          )}
        </div>

        <button
          onClick={toggleOpen}
          disabled={toggling}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold transition-all
            ${shop.isOpen
              ? 'bg-red-100 text-red-700 hover:bg-red-200 border border-red-200'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200'
            }`}
        >
          {toggling
            ? <span className="animate-pulse">…</span>
            : shop.isOpen
              ? <><PowerOff size={15} strokeWidth={2} /> Close Shop</>
              : <><Power size={15} strokeWidth={2} /> Open Shop</>
          }
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8" data-reveal>
        <StatCard label="Active Orders"   value={orders.length}  icon={Package}    accent="sauce" />
        <StatCard label="Pending"         value={pending}        icon={Clock}      accent="chicory" />
        <StatCard label="Today's Revenue" value={`₹${revenue}`} icon={TrendingUp} accent="emerald" />
        <StatCard
          label="Rating"
          value={shop.totalReviews > 0 ? `${Number(shop.rating).toFixed(1)} ★` : 'N/A'}
          icon={Star}
          accent="mustard"
        />
      </div>

      {/* Quick links */}
      <p className="section-label" data-reveal>Quick Actions</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" data-reveal>
        {quickLinks.map(({ to, label, desc, icon: Icon, badge, accent }) => {
          const borderMap = { sauce: 'hover:border-[hsl(var(--buffalo-sauce)/0.5)]', chicory: 'hover:border-[hsl(var(--red-chicory)/0.5)]', mustard: 'hover:border-[hsl(var(--mustard-oil))]' };
          const iconBgMap = { sauce: 'bg-[hsl(var(--buffalo-sauce)/0.1)] text-[hsl(var(--buffalo-sauce))]', chicory: 'bg-[hsl(var(--red-chicory)/0.1)] text-[hsl(var(--red-chicory))]', mustard: 'bg-[hsl(var(--mustard-oil)/0.2)] text-[hsl(var(--mustard-oil)/0.7)]' };
          return (
            <Link
              key={to}
              to={to}
              className={`card p-5 relative block transition-all duration-200 hover:shadow-card-md hover:-translate-y-0.5 ${borderMap[accent]}`}
            >
              {badge > 0 && (
                <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 bg-[hsl(var(--buffalo-sauce))] text-white text-[10px] font-bold rounded-full">
                  {badge}
                </span>
              )}
              <div className={`flex items-center justify-center w-10 h-10 rounded-xl mb-4 ${iconBgMap[accent]}`}>
                <Icon size={18} strokeWidth={2} />
              </div>
              <p className="font-semibold text-card-foreground mb-1">{label}</p>
              <p className="text-xs text-muted-foreground">{desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

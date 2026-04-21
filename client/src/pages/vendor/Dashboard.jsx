import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function VendorDashboard() {
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get('/shops/my-shop')
      .then(r => {
        setShop(r.data);
        return api.get(`/orders/shop/${r.data._id}`);
      })
      .then(r => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleOpen = async () => {
    setToggling(true);
    try {
      const { data } = await api.patch(`/shops/${shop._id}/toggle-open`);
      setShop(data);
    } catch {}
    setToggling(false);
  };

  if (loading) return <Spinner />;

  if (!shop) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🏪</p>
        <p className="text-gray-500 text-lg mb-2">You don't have a shop yet.</p>
        <p className="text-gray-400 text-sm mb-6">Create your shop and start selling on campus</p>
        <button onClick={() => navigate('/vendor/menu')} className="btn-primary px-6">Create Your Shop</button>
      </div>
    );
  }

  const pending = orders.filter(o => o.status === 'pending').length;
  const revenue = orders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status))
    .reduce((s, o) => s + o.totalAmount, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
          <p className="text-gray-500 text-sm mt-1">📍 {shop.location || 'No location set'}</p>
          {!shop.isApproved && (
            <span className="badge bg-yellow-100 text-yellow-800 mt-2">⚠ Pending Admin Approval</span>
          )}
        </div>
        <button onClick={toggleOpen} disabled={toggling}
          className={`btn ${shop.isOpen ? 'btn-danger' : 'btn-success'}`}>
          {toggling ? '…' : shop.isOpen ? '🔴 Close Shop' : '🟢 Open Shop'}
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Orders', value: orders.length, color: 'text-orange-600', bg: 'bg-orange-50', icon: '📦' },
          { label: 'Pending', value: pending, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '⏳' },
          { label: "Today's Revenue", value: `₹${revenue}`, color: 'text-green-600', bg: 'bg-green-50', icon: '💰' },
          { label: 'Rating', value: shop.totalReviews > 0 ? `${Number(shop.rating).toFixed(1)} ★` : 'N/A', color: 'text-yellow-500', bg: 'bg-yellow-50', icon: '⭐' },
        ].map(s => (
          <div key={s.label} className={`card p-4 text-center ${s.bg}`}>
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/vendor/incoming', label: 'Incoming Orders', desc: 'Accept or reject new orders', icon: '🔔', badge: pending },
          { to: '/vendor/queue', label: 'Order Queue', desc: 'Mark orders as preparing / ready', icon: '👨‍🍳' },
          { to: '/vendor/menu', label: 'Manage Menu', desc: 'Add, edit or toggle products', icon: '📋' },
        ].map(l => (
          <Link key={l.to} to={l.to} className="card p-5 hover:shadow-md hover:border-orange-200 transition-all block relative group">
            {l.badge > 0 && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {l.badge}
              </span>
            )}
            <p className="text-3xl mb-2">{l.icon}</p>
            <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{l.label}</p>
            <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

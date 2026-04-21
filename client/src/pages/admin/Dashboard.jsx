import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  accepted: 'bg-blue-100 text-blue-800',
  rejected: 'bg-red-100 text-red-800',
  preparing: 'bg-purple-100 text-purple-800',
  ready: 'bg-orange-100 text-orange-800',
  picked_up: 'bg-cyan-100 text-cyan-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/admin/stats'), api.get('/admin/orders')])
      .then(([s, o]) => { setStats(s.data); setOrders(o.data.slice(0, 10)); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Orders', value: stats.totalOrders, color: 'text-orange-600', bg: 'bg-orange-50', icon: '📦' },
            { label: 'Total Users', value: stats.totalUsers, color: 'text-blue-600', bg: 'bg-blue-50', icon: '👥' },
            { label: 'Active Shops', value: stats.totalShops, color: 'text-green-600', bg: 'bg-green-50', icon: '🏪' },
            { label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: '💰' },
          ].map(s => (
            <div key={s.label} className={`card p-4 text-center ${s.bg}`}>
              <p className="text-2xl mb-1">{s.icon}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        {[
          { to: '/admin/shops', label: 'Manage Shops', desc: 'Approve or suspend shops', icon: '🏪' },
          { to: '/admin/users', label: 'Manage Users', desc: 'View and toggle user accounts', icon: '👥' },
        ].map(l => (
          <Link key={l.to} to={l.to} className="card p-5 hover:shadow-md hover:border-orange-200 transition-all group">
            <p className="text-3xl mb-2">{l.icon}</p>
            <p className="font-semibold text-gray-800 group-hover:text-orange-600 transition-colors">{l.label}</p>
            <p className="text-sm text-gray-500 mt-1">{l.desc}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-semibold text-gray-700 mb-3">Recent Orders</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Student</th>
              <th className="text-left px-4 py-3">Shop</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{o.student?.name || '—'}</td>
                <td className="px-4 py-3 text-gray-600">{o.shop?.name || '—'}</td>
                <td className="px-4 py-3 font-semibold text-gray-800">₹{o.totalAmount}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

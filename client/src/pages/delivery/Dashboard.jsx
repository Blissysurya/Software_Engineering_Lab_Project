import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function DeliveryDashboard() {
  const [available, setAvailable] = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [tab, setTab] = useState('available');

  const fetchData = async () => {
    const [a, m] = await Promise.all([
      api.get('/delivery/available'),
      api.get('/delivery/my'),
    ]);
    setAvailable(a.data);
    setMyDeliveries(m.data);
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, []);

  const assign = async orderId => {
    setActing(orderId);
    try { await api.post(`/delivery/assign/${orderId}`); await fetchData(); }
    catch {} setActing(null);
  };

  const deliver = async orderId => {
    setActing(orderId);
    try { await api.patch(`/delivery/deliver/${orderId}`); await fetchData(); }
    catch {} setActing(null);
  };

  const active = myDeliveries.filter(o => o.status === 'picked_up');

  const STATUS_COLORS = {
    picked_up: 'bg-cyan-100 text-cyan-800',
    delivered: 'bg-green-100 text-green-800',
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Delivery Dashboard</h1>

      {active.length > 0 && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-orange-700 mb-3 flex items-center gap-2">🚴 Active Delivery</h2>
          {active.map(o => (
            <div key={o._id} className="flex justify-between items-center">
              <div>
                <p className="font-medium text-gray-800">{o.shop?.name}</p>
                <p className="text-sm text-gray-600">To: {o.student?.address || o.student?.name}</p>
                <p className="text-sm font-bold text-gray-700">₹{o.totalAmount}</p>
              </div>
              <button onClick={() => deliver(o._id)} disabled={acting === o._id} className="btn-success text-sm">
                {acting === o._id ? '…' : '✓ Mark Delivered'}
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {['available', 'history'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
              tab === t ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {t} {t === 'available' && available.length > 0 && `(${available.length})`}
          </button>
        ))}
        <button onClick={fetchData} className="ml-auto btn-secondary text-sm">↻ Refresh</button>
      </div>

      {tab === 'available' && (
        available.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">🛵</p>
            <p>No orders available for delivery right now.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {available.map(o => (
              <div key={o._id} className="card p-5 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{o.shop?.name}</p>
                    <p className="text-xs text-gray-400">📍 {o.shop?.location}</p>
                  </div>
                  <span className="font-bold text-gray-700">₹{o.totalAmount}</span>
                </div>
                <p className="text-sm text-gray-600 mb-1">Deliver to: <span className="font-medium">{o.student?.address || o.student?.name}</span></p>
                <p className="text-sm text-gray-500 mb-3">{o.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}</p>
                <button onClick={() => assign(o._id)} disabled={acting === o._id} className="btn-primary text-sm">
                  {acting === o._id ? '…' : '🛵 Pick Up This Order'}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {tab === 'history' && (
        myDeliveries.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p>No delivery history.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myDeliveries.map(o => (
              <div key={o._id} className="card p-4 flex justify-between items-center">
                <div>
                  <p className="font-medium text-gray-800">{o.shop?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(o.updatedAt).toLocaleString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-700">₹{o.totalAmount}</p>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function IncomingOrders() {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchOrders = async (shopId) => {
    const { data } = await api.get(`/orders/shop/${shopId}`);
    setOrders(data.filter(o => o.status === 'pending'));
  };

  useEffect(() => {
    api.get('/shops/my-shop')
      .then(r => { setShop(r.data); return fetchOrders(r.data._id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const act = async (orderId, status) => {
    setActing(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      if (shop) fetchOrders(shop._id);
    } catch {}
    setActing(null);
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Incoming Orders</h1>
        <button onClick={() => shop && fetchOrders(shop._id)} className="btn-secondary text-sm">Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🎉</p>
          <p>No pending orders right now.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="card p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">{o.student?.name}</p>
                  <p className="text-sm text-gray-500">{o.student?.phone} · {o.student?.address}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">₹{o.totalAmount}</p>
                  <span className={`badge ${o.deliveryType === 'delivery' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {o.deliveryType}
                  </span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3 mb-3">
                {o.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-0.5">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₹{item.price * item.quantity}</span>
                  </div>
                ))}
                {o.specialInstructions && (
                  <p className="text-xs text-gray-500 mt-2 italic">Note: {o.specialInstructions}</p>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => act(o._id, 'accepted')} disabled={acting === o._id} className="btn-success text-sm flex-1">
                  {acting === o._id ? '…' : 'Accept'}
                </button>
                <button onClick={() => act(o._id, 'rejected')} disabled={acting === o._id} className="btn-danger text-sm flex-1">
                  {acting === o._id ? '…' : 'Reject'}
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">{new Date(o.createdAt).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

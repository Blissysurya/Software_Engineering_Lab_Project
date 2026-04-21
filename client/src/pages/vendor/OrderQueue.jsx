import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const NEXT_STATUS = { accepted: 'preparing', preparing: 'ready' };
const NEXT_LABEL = { accepted: 'Start Preparing', preparing: 'Mark Ready' };

export default function OrderQueue() {
  const [shop, setShop] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);

  const fetchOrders = async (shopId) => {
    const { data } = await api.get(`/orders/shop/${shopId}`);
    setOrders(data.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status)));
  };

  useEffect(() => {
    api.get('/shops/my-shop')
      .then(r => { setShop(r.data); return fetchOrders(r.data._id); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const advance = async (orderId, status) => {
    setActing(orderId);
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      if (shop) fetchOrders(shop._id);
    } catch {}
    setActing(null);
  };

  const markPickupCollected = async orderId => {
    setActing(orderId);
    try {
      await api.patch(`/orders/${orderId}/pickup-collected`);
      if (shop) fetchOrders(shop._id);
    } catch {}
    setActing(null);
  };

  const STATUS_COLORS = {
    accepted: 'bg-blue-100 text-blue-800',
    preparing: 'bg-purple-100 text-purple-800',
    ready: 'bg-green-100 text-green-800',
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Order Queue</h1>
        <button onClick={() => shop && fetchOrders(shop._id)} className="btn-secondary text-sm">Refresh</button>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">✅</p>
          <p>Queue is clear!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="card p-5">
              <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-gray-800">{o.student?.name}</p>
                <span className={`badge ${STATUS_COLORS[o.status]}`}>{o.status}</span>
              </div>
              <div className="text-sm text-gray-500 mb-3">
                {o.items.map((item, i) => <span key={i}>{item.name} ×{item.quantity}{i < o.items.length-1 ? ', ' : ''}</span>)}
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-700">₹{o.totalAmount} · <span className="capitalize font-normal">{o.deliveryType}</span></span>
                {o.deliveryType === 'pickup' && o.status === 'ready' ? (
                  <button
                    onClick={() => markPickupCollected(o._id)}
                    disabled={acting === o._id}
                    className="btn-success text-sm"
                  >
                    {acting === o._id ? '…' : 'Mark Picked Up'}
                  </button>
                ) : NEXT_STATUS[o.status] ? (
                  <button
                    onClick={() => advance(o._id, NEXT_STATUS[o.status])}
                    disabled={acting === o._id}
                    className="btn-primary text-sm"
                  >
                    {acting === o._id ? '…' : NEXT_LABEL[o.status]}
                  </button>
                ) : null}
                {o.status === 'ready' && (
                  <span className="text-green-600 font-medium text-sm">Ready for {o.deliveryType === 'pickup' ? 'Pickup' : 'Delivery'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

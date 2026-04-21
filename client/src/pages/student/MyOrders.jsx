import { useState, useEffect } from 'react';
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

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, comment: '' });
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [cancelling, setCancelling] = useState(null);

  const fetchOrders = () => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchOrders, []);

  const cancel = async id => {
    setCancelling(id);
    try {
      await api.patch(`/orders/${id}/cancel`);
      fetchOrders();
    } catch {}
    setCancelling(null);
  };

  const submitReview = async e => {
    e.preventDefault();
    try {
      await api.post('/reviews', { orderId: reviewForm.orderId, rating: reviewForm.rating, comment: reviewForm.comment });
      setReviewedIds(s => new Set([...s, reviewForm.orderId]));
      setReviewForm({ orderId: null, rating: 5, comment: '' });
    } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-3">📋</p>
          <p className="text-gray-400">No orders yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o._id} className="card overflow-hidden">
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === o._id ? null : o._id)}
              >
                <div>
                  <p className="font-semibold text-gray-800">{o.shop?.name}</p>
                  <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-700">₹{o.totalAmount}</span>
                  <span className={`badge ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                    {o.status.replace('_', ' ')}
                  </span>
                  <span className="text-gray-400 text-sm">{expanded === o._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === o._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50">
                  <div className="space-y-1 mb-3">
                    {o.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name} × {item.quantity}</span>
                        <span className="font-medium">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">Type: <span className="capitalize font-medium">{o.deliveryType}</span></p>
                  {o.deliveryAddress && <p className="text-sm text-gray-500">Address: {o.deliveryAddress}</p>}
                  {o.specialInstructions && <p className="text-sm text-gray-500">Note: {o.specialInstructions}</p>}

                  {o.status === 'pending' && (
                    <button onClick={() => cancel(o._id)} disabled={cancelling === o._id}
                      className="btn-danger text-sm mt-3">
                      {cancelling === o._id ? 'Cancelling…' : 'Cancel Order'}
                    </button>
                  )}

                  {o.status === 'delivered' && !reviewedIds.has(o._id) && reviewForm.orderId !== o._id && (
                    <button onClick={() => setReviewForm(f => ({ ...f, orderId: o._id }))}
                      className="btn-secondary text-sm mt-3">
                      ⭐ Leave a Review
                    </button>
                  )}

                  {reviewForm.orderId === o._id && (
                    <form onSubmit={submitReview} className="mt-3 space-y-2 bg-white rounded-lg p-3 border border-orange-100">
                      <div className="flex gap-2 items-center">
                        <label className="text-sm font-medium text-gray-700">Rating:</label>
                        <select className="input w-20 py-1" value={reviewForm.rating}
                          onChange={e => setReviewForm(f => ({ ...f, rating: Number(e.target.value) }))}>
                          {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ★</option>)}
                        </select>
                      </div>
                      <textarea className="input resize-none" rows={2} placeholder="Write your review…"
                        value={reviewForm.comment}
                        onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))} />
                      <div className="flex gap-2">
                        <button type="submit" className="btn-primary text-sm">Submit</button>
                        <button type="button" onClick={() => setReviewForm({ orderId: null, rating: 5, comment: '' })}
                          className="btn-secondary text-sm">Cancel</button>
                      </div>
                    </form>
                  )}
                  {reviewedIds.has(o._id) && (
                    <p className="text-green-600 text-sm mt-2 font-medium">✓ Review submitted</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

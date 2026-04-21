import { useState, useEffect, useRef } from 'react';
import {
  Package, ChevronDown, ChevronUp, XCircle, Star,
  MapPin, Truck, StickyNote, CheckCircle2, ClipboardList,
} from 'lucide-react';
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

export default function MyOrders() {
  const pageRef = useRef(null);
  const [orders, setOrders]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [reviewForm, setReviewForm] = useState({ orderId: null, rating: 5, comment: '' });
  const [reviewedIds, setReviewedIds] = useState(new Set());
  const [cancelling, setCancelling]   = useState(null);

  const fetchOrders = () => {
    api.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchOrders, []);
  useScrollReveal(pageRef);

  const cancel = async id => {
    setCancelling(id);
    try { await api.patch(`/orders/${id}/cancel`); fetchOrders(); } catch {}
    setCancelling(null);
  };

  const submitReview = async e => {
    e.preventDefault();
    try {
      await api.post('/reviews', {
        orderId: reviewForm.orderId,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewedIds(s => new Set([...s, reviewForm.orderId]));
      setReviewForm({ orderId: null, rating: 5, comment: '' });
    } catch {}
  };

  if (loading) return <Spinner />;

  return (
    <div ref={pageRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center gap-3 mb-8" data-reveal>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--red-chicory)/0.1)]">
          <Package size={20} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold text-[hsl(var(--red-chicory))]">My Orders</h1>
          <p className="text-muted-foreground text-xs mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList size={44} className="mx-auto mb-4 text-muted-foreground/30" strokeWidth={1.5} />
          <p className="font-display text-xl font-semibold text-foreground mb-1">No orders yet</p>
          <p className="text-muted-foreground text-sm">Your orders will appear here once you place one.</p>
        </div>
      ) : (
        <div className="space-y-3" data-reveal>
          {orders.map(o => {
            const isOpen = expanded === o._id;
            return (
              <div key={o._id} className="card overflow-hidden">
                {/* Summary row */}
                <button
                  className="w-full flex items-center justify-between gap-3 p-4 hover:bg-muted/30 transition-colors text-left"
                  onClick={() => setExpanded(isOpen ? null : o._id)}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-[hsl(var(--breezy-beige))] shrink-0">
                      <Package size={16} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-card-foreground truncate">{o.shop?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(o.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-bold text-sm text-card-foreground">₹{o.totalAmount}</span>
                    <span className={STATUS_BADGE[o.status] || 'badge'}>
                      {o.status.replace('_', ' ')}
                    </span>
                    {isOpen
                      ? <ChevronUp size={15} className="text-muted-foreground" />
                      : <ChevronDown size={15} className="text-muted-foreground" />
                    }
                  </div>
                </button>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="border-t border-border bg-[hsl(var(--breezy-beige)/0.4)] p-4 space-y-3">
                    {/* Items */}
                    <div className="space-y-1.5">
                      {o.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{item.name} × {item.quantity}</span>
                          <span className="font-medium text-card-foreground">₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-1 border-t border-border/60">
                      <span className="flex items-center gap-1">
                        <Truck size={11} strokeWidth={2} />
                        <span className="capitalize">{o.deliveryType}</span>
                      </span>
                      {o.deliveryAddress && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} strokeWidth={2} />
                          {o.deliveryAddress}
                        </span>
                      )}
                      {o.specialInstructions && (
                        <span className="flex items-center gap-1">
                          <StickyNote size={11} strokeWidth={2} />
                          {o.specialInstructions}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    {o.status === 'pending' && (
                      <button
                        onClick={() => cancel(o._id)}
                        disabled={cancelling === o._id}
                        className="btn-danger text-xs h-8 px-3 gap-1.5"
                      >
                        <XCircle size={13} strokeWidth={2} />
                        {cancelling === o._id ? 'Cancelling…' : 'Cancel Order'}
                      </button>
                    )}

                    {o.status === 'delivered' && !reviewedIds.has(o._id) && reviewForm.orderId !== o._id && (
                      <button
                        onClick={() => setReviewForm(f => ({ ...f, orderId: o._id }))}
                        className="btn-secondary text-xs h-8 px-3 gap-1.5"
                      >
                        <Star size={13} strokeWidth={2} /> Leave a Review
                      </button>
                    )}

                    {reviewForm.orderId === o._id && (
                      <form onSubmit={submitReview} className="bg-card border border-border rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <label className="text-xs font-medium text-foreground">Rating</label>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewForm(f => ({ ...f, rating: n }))}
                                className={`text-lg transition-colors ${
                                  n <= reviewForm.rating ? 'text-amber-400' : 'text-muted'
                                }`}
                              >
                                ★
                              </button>
                            ))}
                          </div>
                        </div>
                        <textarea
                          className="input resize-none text-sm"
                          rows={2}
                          placeholder="Write your review…"
                          value={reviewForm.comment}
                          onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                        />
                        <div className="flex gap-2">
                          <button type="submit" className="btn-primary text-xs h-8 px-3">Submit</button>
                          <button
                            type="button"
                            onClick={() => setReviewForm({ orderId: null, rating: 5, comment: '' })}
                            className="btn-ghost text-xs h-8 px-3 text-muted-foreground"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {reviewedIds.has(o._id) && (
                      <p className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                        <CheckCircle2 size={13} strokeWidth={2} /> Review submitted — thank you!
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

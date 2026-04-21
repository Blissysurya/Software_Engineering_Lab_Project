import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft, MapPin, Star, Clock, Plus, Minus,
  PackageX, ShoppingCart, MessageSquare,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useCart } from '../../context/CartContext';
import useScrollReveal from '../../hooks/useScrollReveal';
import { Button } from '../../components/ui/button';

function StarRow({ rating, count }) {
  return (
    <span className="flex items-center gap-1 text-sm text-amber-500 font-medium">
      {'★'.repeat(Math.round(rating))}
      <span className="text-muted-foreground font-normal text-xs ml-1">
        {Number(rating).toFixed(1)} ({count} reviews)
      </span>
    </span>
  );
}

export default function ShopDetail() {
  const pageRef = useRef(null);
  const { id }  = useParams();
  const navigate = useNavigate();
  const { addToCart, updateItem, getItemQuantity } = useCart();
  const [shop, setShop]         = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [actingProduct, setActingProduct] = useState(null);
  const [msg, setMsg] = useState({ text: '', ok: true });

  useEffect(() => {
    Promise.all([
      api.get(`/shops/${id}`),
      api.get(`/products/shop/${id}`),
      api.get(`/reviews/shop/${id}`),
    ]).then(([s, p, r]) => {
      setShop(s.data); setProducts(p.data); setReviews(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  useScrollReveal(pageRef);

  const changeQuantity = async (productId, delta) => {
    const currentQty = getItemQuantity(productId);
    const nextQty = Math.max(0, currentQty + delta);
    setActingProduct(productId);
    setMsg({ text: '', ok: true });
    try {
      if (currentQty === 0 && nextQty > 0) await addToCart(productId, nextQty);
      else await updateItem(productId, nextQty);
    } catch (err) {
      setMsg({ text: err.response?.data?.message || 'Error adding to cart', ok: false });
    } finally {
      setActingProduct(null);
    }
  };

  const byCategory = products.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  if (loading) return <Spinner />;
  if (!shop) return <p className="text-center py-16 text-muted-foreground">Shop not found.</p>;

  return (
    <div ref={pageRef} className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[hsl(var(--buffalo-sauce))] transition-colors mb-6"
      >
        <ChevronLeft size={16} strokeWidth={2} /> Back to shops
      </button>

      {/* Shop header */}
      <div className="card p-6 mb-6 border-l-4 border-[hsl(var(--buffalo-sauce))]" data-reveal>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[hsl(var(--red-chicory))] mb-1">
              {shop.name}
            </h1>
            {shop.description && (
              <p className="text-muted-foreground text-sm leading-relaxed mb-3 max-w-xl">{shop.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-sm">
              {shop.location && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <MapPin size={13} strokeWidth={2} />{shop.location}
                </span>
              )}
              {shop.totalReviews > 0 && <StarRow rating={shop.rating} count={shop.totalReviews} />}
            </div>
          </div>
          <span className={`${shop.isOpen ? 'badge-open' : 'badge-closed'} self-start shrink-0`}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Alert message */}
      {msg.text && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2.5 rounded-xl mb-4 ${
          msg.ok
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg.text}
        </div>
      )}

      {/* Products */}
      {products.length === 0 ? (
        <div className="text-center py-16">
          <PackageX size={40} className="mx-auto mb-4 text-muted-foreground/40" strokeWidth={1.5} />
          <p className="text-muted-foreground">No products listed yet.</p>
        </div>
      ) : (
        Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="mb-8" data-reveal>
            <div className="divider-label mb-4">{cat}</div>
            <div className="space-y-2.5">
              {items.map(p => {
                const qty = getItemQuantity(p._id);
                const busy = actingProduct === p._id;
                return (
                  <div
                    key={p._id}
                    className="card flex items-center justify-between gap-4 p-4 hover:shadow-card-md transition-shadow"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-card-foreground">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock size={10} strokeWidth={2} /> ~{p.preparationTime} min
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-bold text-sm text-card-foreground">₹{p.price}</span>
                      {p.isAvailable ? (
                        qty > 0 ? (
                          <div className="qty-stepper">
                            <button
                              onClick={() => changeQuantity(p._id, -1)}
                              disabled={busy || !shop.isOpen}
                              className="qty-btn"
                              aria-label={`Decrease ${p.name}`}
                            >
                              <Minus size={12} strokeWidth={2.5} />
                            </button>
                            <span className="qty-count">{qty}</span>
                            <button
                              onClick={() => changeQuantity(p._id, 1)}
                              disabled={busy || !shop.isOpen}
                              className="qty-btn"
                              aria-label={`Increase ${p.name}`}
                            >
                              <Plus size={12} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => changeQuantity(p._id, 1)}
                            disabled={busy || !shop.isOpen}
                            className="h-8 px-3 gap-1.5 text-xs border-[hsl(var(--buffalo-sauce))] text-[hsl(var(--buffalo-sauce))] hover:bg-[hsl(var(--buffalo-sauce))] hover:text-white"
                          >
                            <Plus size={12} strokeWidth={2.5} />
                            {busy ? '…' : 'Add'}
                          </Button>
                        )
                      ) : (
                        <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
                          Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-10" data-reveal>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare size={16} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
            <h2 className="font-display font-bold text-lg text-[hsl(var(--red-chicory))]">Reviews</h2>
            <span className="badge badge-pending ml-1">{reviews.length}</span>
          </div>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-medium text-sm text-card-foreground">{r.student?.name}</span>
                  <span className="text-amber-500 text-sm">
                    {'★'.repeat(r.rating)}
                    <span className="text-muted-foreground">{'☆'.repeat(5 - r.rating)}</span>
                  </span>
                </div>
                {r.comment && <p className="text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

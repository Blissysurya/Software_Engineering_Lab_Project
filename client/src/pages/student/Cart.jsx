import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Trash2, Store, ArrowRight, PackageOpen } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { Button } from '../../components/ui/button';

export default function CartPage() {
  const { cart, updateItem, clearCart, total, count } = useCart();
  const navigate = useNavigate();
  const [actingItem, setActingItem] = useState(null);

  const changeQuantity = async (productId, currentQty, delta) => {
    if (!productId) return;
    const nextQty = Math.max(0, currentQty + delta);
    setActingItem(productId);
    try { await updateItem(productId, nextQty); } catch {}
    setActingItem(null);
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-muted mx-auto mb-6">
          <PackageOpen size={36} className="text-muted-foreground/50" strokeWidth={1.5} />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground text-sm mb-8">Add items from a campus shop to get started</p>
        <Button onClick={() => navigate('/shops')} className="gap-2 px-6">
          <Store size={15} /> Browse Shops
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-display text-3xl font-bold text-[hsl(var(--red-chicory))]">Your Cart</h1>
          {cart.shop && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1.5">
              <Store size={12} strokeWidth={2} />
              {cart.shop.name}
            </p>
          )}
        </div>
        <button
          onClick={clearCart}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50"
        >
          <Trash2 size={13} strokeWidth={2} />
          Clear cart
        </button>
      </div>

      {/* Items */}
      <div className="space-y-2.5 mb-6">
        {cart.items.map(item => {
          const productId = typeof item.product === 'string' ? item.product : item.product?._id;
          const busy = actingItem === productId;

          return (
            <div
              key={productId || item._id}
              className="card flex items-center justify-between gap-4 px-4 py-3.5"
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-card-foreground text-sm truncate">{item.product?.name || '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">₹{item.price} each</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="qty-stepper">
                  <button
                    onClick={() => changeQuantity(productId, item.quantity, -1)}
                    disabled={busy}
                    className="qty-btn"
                    aria-label="Decrease"
                  >
                    <Minus size={12} strokeWidth={2.5} />
                  </button>
                  <span className="qty-count">{item.quantity}</span>
                  <button
                    onClick={() => changeQuantity(productId, item.quantity, 1)}
                    disabled={busy}
                    className="qty-btn"
                    aria-label="Increase"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                  </button>
                </div>
                <span className="w-16 text-right font-semibold text-sm text-card-foreground">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary card */}
      <div className="card p-4 mb-6 bg-[hsl(var(--breezy-beige))] border-[hsl(var(--mustard-oil)/0.4)]">
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-1">
          <span>Subtotal ({count} item{count !== 1 ? 's' : ''})</span>
          <span className="font-medium text-foreground">₹{total}</span>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-2 mt-2">
          <span className="font-semibold text-foreground">Total</span>
          <span className="text-xl font-bold text-[hsl(var(--buffalo-sauce))]">₹{total}</span>
        </div>
      </div>

      <Button
        onClick={() => navigate('/checkout')}
        className="w-full h-12 text-sm font-semibold gap-2"
      >
        Proceed to Checkout <ArrowRight size={16} />
      </Button>
    </div>
  );
}

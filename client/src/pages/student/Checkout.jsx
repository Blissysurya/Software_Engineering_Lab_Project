import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useCart } from '../../context/CartContext';

export default function Checkout() {
  const { cart, total, fetchCart } = useCart();
  const navigate = useNavigate();
  const [form, setForm] = useState({ deliveryType: 'pickup', deliveryAddress: '', specialInstructions: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.deliveryType === 'delivery' && !form.deliveryAddress.trim()) {
      setError('Please enter a delivery address');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/orders', form);
      await fetchCart();
      navigate('/orders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items?.length) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/cart')} className="text-sm text-orange-600 mb-4 hover:underline">← Back to cart</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <div className="card p-4 mb-6">
        <h2 className="font-semibold text-gray-700 mb-3">Order Summary</h2>
        {cart.items.map(item => (
          <div key={item.product?._id} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
            <span className="text-gray-600">{item.product?.name} × {item.quantity}</span>
            <span className="font-medium">₹{item.price * item.quantity}</span>
          </div>
        ))}
        <div className="flex justify-between font-bold mt-3 pt-3 border-t border-gray-200">
          <span>Total</span>
          <span className="text-orange-600">₹{total}</span>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Option</label>
          <div className="flex gap-4">
            {['pickup', 'delivery'].map(t => (
              <label key={t} className={`flex-1 border-2 rounded-xl p-4 cursor-pointer transition-all ${
                form.deliveryType === t
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-200 hover:border-orange-200'
              }`}>
                <input type="radio" className="sr-only" value={t} checked={form.deliveryType === t} onChange={set('deliveryType')} />
                <p className="font-semibold capitalize text-center text-gray-800">{t}</p>
                <p className="text-xs text-gray-500 text-center mt-1">
                  {t === 'pickup' ? '🏪 Collect from shop' : '🚴 Delivered to your hostel'}
                </p>
              </label>
            ))}
          </div>
        </div>

        {form.deliveryType === 'delivery' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Address</label>
            <input className="input" required value={form.deliveryAddress} onChange={set('deliveryAddress')}
              placeholder="Block A, Room 201" />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Special Instructions <span className="text-gray-400 font-normal">(optional)</span></label>
          <textarea className="input resize-none" rows={2} value={form.specialInstructions} onChange={set('specialInstructions')}
            placeholder="Less spicy, no onions…" />
        </div>

        <button type="submit" className="btn-primary w-full text-base py-3" disabled={loading}>
          {loading ? 'Placing order…' : `Place Order · ₹${total}`}
        </button>
      </form>
    </div>
  );
}

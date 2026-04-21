import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, updateItem, clearCart, total, count } = useCart();
  const navigate = useNavigate();

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-6xl mb-4">🛒</p>
        <p className="text-gray-500 text-lg mb-2">Your cart is empty</p>
        <p className="text-gray-400 text-sm mb-6">Add items from a shop to get started</p>
        <button onClick={() => navigate('/shops')} className="btn-primary px-6">Browse Shops</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Your Cart</h1>
        <button onClick={clearCart} className="text-sm text-red-500 hover:underline">Clear cart</button>
      </div>

      {cart.shop && (
        <p className="text-sm text-gray-500 mb-4">From: <span className="font-semibold text-gray-700">{cart.shop.name}</span></p>
      )}

      <div className="space-y-3 mb-6">
        {cart.items.map(item => (
          <div key={item.product?._id || item._id} className="card p-4 flex justify-between items-center">
            <div>
              <p className="font-medium text-gray-800">{item.product?.name || '—'}</p>
              <p className="text-sm text-gray-500">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => updateItem(item.product?._id, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center font-bold transition-colors"
              >−</button>
              <span className="w-5 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => updateItem(item.product?._id, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-orange-100 hover:bg-orange-200 text-orange-700 flex items-center justify-center font-bold transition-colors"
              >+</button>
              <span className="ml-2 w-16 text-right font-semibold text-gray-800">₹{item.price * item.quantity}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-4 flex justify-between items-center mb-6 bg-orange-50 border-orange-200">
        <span className="font-semibold text-gray-700">Total ({count} items)</span>
        <span className="text-xl font-bold text-orange-600">₹{total}</span>
      </div>

      <button onClick={() => navigate('/checkout')} className="btn-primary w-full text-base py-3">
        Proceed to Checkout →
      </button>
    </div>
  );
}

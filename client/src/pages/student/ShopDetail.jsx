import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import { useCart } from '../../context/CartContext';

export default function ShopDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/shops/${id}`),
      api.get(`/products/shop/${id}`),
      api.get(`/reviews/shop/${id}`),
    ]).then(([s, p, r]) => {
      setShop(s.data); setProducts(p.data); setReviews(r.data);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = async productId => {
    setAdding(productId);
    setMsg('');
    try {
      await addToCart(productId, 1);
      setMsg('Added to cart!');
      setTimeout(() => setMsg(''), 2000);
    } catch (err) {
      setMsg(err.response?.data?.message || 'Error adding to cart');
    } finally {
      setAdding(null);
    }
  };

  const byCategory = products.reduce((acc, p) => {
    (acc[p.category] = acc[p.category] || []).push(p);
    return acc;
  }, {});

  if (loading) return <Spinner />;
  if (!shop) return <p className="text-center py-12 text-gray-500">Shop not found.</p>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="text-sm text-orange-600 mb-4 hover:underline flex items-center gap-1">
        ← Back
      </button>

      <div className="card p-6 mb-6 border-l-4 border-orange-500">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{shop.name}</h1>
            <p className="text-gray-500 mt-1">{shop.description}</p>
            {shop.location && <p className="text-sm text-gray-400 mt-1">📍 {shop.location}</p>}
          </div>
          <span className={`badge ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {shop.isOpen ? 'Open' : 'Closed'}
          </span>
        </div>
        {shop.totalReviews > 0 && (
          <p className="text-yellow-500 mt-2 text-sm">{'★'.repeat(Math.round(shop.rating))} {Number(shop.rating).toFixed(1)} ({shop.totalReviews} reviews)</p>
        )}
      </div>

      {msg && (
        <div className={`text-sm px-4 py-2 rounded-lg mb-4 ${
          msg === 'Added to cart!'
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {msg}
        </div>
      )}

      {products.length === 0 ? (
        <p className="text-gray-400 text-center py-8">No products listed yet.</p>
      ) : (
        Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="mb-6">
            <h2 className="font-semibold text-orange-600 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="flex-1 border-t border-orange-100" />
              {cat}
              <span className="flex-1 border-t border-orange-100" />
            </h2>
            <div className="space-y-3">
              {items.map(p => (
                <div key={p._id} className="card p-4 flex justify-between items-center hover:shadow-md transition-shadow">
                  <div>
                    <p className="font-medium text-gray-800">{p.name}</p>
                    {p.description && <p className="text-sm text-gray-500">{p.description}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">⏱ ~{p.preparationTime} min</p>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <p className="font-bold text-gray-800">₹{p.price}</p>
                    {p.isAvailable ? (
                      <button
                        onClick={() => handleAdd(p._id)}
                        disabled={adding === p._id || !shop.isOpen}
                        className="btn-primary text-sm py-1.5 px-3"
                      >
                        {adding === p._id ? '…' : '+ Add'}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">Unavailable</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {reviews.length > 0 && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-700 mb-3">Reviews</h2>
          <div className="space-y-3">
            {reviews.map(r => (
              <div key={r._id} className="card p-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-sm text-gray-700">{r.student?.name}</span>
                  <span className="text-yellow-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                </div>
                {r.comment && <p className="text-sm text-gray-500">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

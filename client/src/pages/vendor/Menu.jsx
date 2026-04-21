import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const EMPTY = { name: '', description: '', price: '', category: 'General', preparationTime: 15 };

export default function VendorMenu() {
  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [shopForm, setShopForm] = useState({ name: '', description: '', category: 'food', location: '' });
  const [shopMode, setShopMode] = useState('create');

  useEffect(() => {
    api.get('/shops/my-shop')
      .then(r => {
        setShop(r.data);
        setShopMode('edit');
        setShopForm({ name: r.data.name, description: r.data.description, category: r.data.category, location: r.data.location });
        return api.get(`/products/shop/${r.data._id}`);
      })
      .then(r => setProducts(r.data))
      .catch(() => setShopMode('create'))
      .finally(() => setLoading(false));
  }, []);

  const saveShop = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (shopMode === 'create') {
        const { data } = await api.post('/shops', shopForm);
        setShop(data); setShopMode('edit');
      } else {
        const { data } = await api.put(`/shops/${shop._id}`, shopForm);
        setShop(data);
      }
    } catch (err) { setError(err.response?.data?.message || 'Error saving shop'); }
    setSaving(false);
  };

  const saveProduct = async e => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      if (editing) {
        const { data } = await api.put(`/products/${editing}`, form);
        setProducts(ps => ps.map(p => p._id === editing ? data : p));
      } else {
        const { data } = await api.post('/products', form);
        setProducts(ps => [...ps, data]);
      }
      setForm(EMPTY); setEditing(null); setShowForm(false);
    } catch (err) { setError(err.response?.data?.message || 'Error saving product'); }
    setSaving(false);
  };

  const deleteProduct = async id => {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    setProducts(ps => ps.filter(p => p._id !== id));
  };

  const toggleAvail = async id => {
    const { data } = await api.patch(`/products/${id}/toggle`);
    setProducts(ps => ps.map(p => p._id === id ? data : p));
  };

  const startEdit = p => {
    setForm({ name: p.name, description: p.description, price: p.price, category: p.category, preparationTime: p.preparationTime });
    setEditing(p._id); setShowForm(true); setError('');
  };

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Shop & Menu</h1>

      <div className="card p-6 mb-8 border-t-4 border-orange-500">
        <h2 className="font-semibold text-gray-700 mb-4">{shopMode === 'create' ? '🏪 Create Your Shop' : '🏪 Shop Details'}</h2>
        {error && <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>}
        <form onSubmit={saveShop} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
            <input className="input" required value={shopForm.name} onChange={e => setShopForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select className="input" value={shopForm.category} onChange={e => setShopForm(f => ({ ...f, category: e.target.value }))}>
              {['food', 'beverages', 'stationery', 'grocery', 'other'].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input className="input" value={shopForm.location} onChange={e => setShopForm(f => ({ ...f, location: e.target.value }))} placeholder="Block C, Ground Floor" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input className="input" value={shopForm.description} onChange={e => setShopForm(f => ({ ...f, description: e.target.value }))} />
          </div>
          <div className="sm:col-span-2 flex items-center gap-3">
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving…' : shopMode === 'create' ? 'Create Shop' : 'Update Shop'}</button>
            {shopMode === 'edit' && shop && !shop.isApproved && (
              <span className="text-xs text-yellow-600">⚠ Awaiting admin approval</span>
            )}
          </div>
        </form>
      </div>

      {shop && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-semibold text-gray-700">Products ({products.length})</h2>
            <button onClick={() => { setForm(EMPTY); setEditing(null); setShowForm(true); setError(''); }} className="btn-primary text-sm">
              + Add Product
            </button>
          </div>

          {showForm && (
            <div className="card p-5 mb-6 border-2 border-orange-300">
              <h3 className="font-semibold text-gray-700 mb-3">{editing ? 'Edit Product' : 'New Product'}</h3>
              {error && <p className="text-red-600 text-sm mb-3">{error}</p>}
              <form onSubmit={saveProduct} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input className="input" required value={form.name} onChange={set('name')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input className="input" value={form.category} onChange={set('category')} placeholder="Snacks, Drinks…" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input className="input" type="number" required min="1" value={form.price} onChange={set('price')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time (min)</label>
                  <input className="input" type="number" value={form.preparationTime} onChange={set('preparationTime')} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input className="input" value={form.description} onChange={set('description')} />
                </div>
                <div className="sm:col-span-2 flex gap-2">
                  <button type="submit" className="btn-primary text-sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                  <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} className="btn-secondary text-sm">Cancel</button>
                </div>
              </form>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-2">🍽️</p>
              <p>No products yet. Add your first item!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(p => (
                <div key={p._id} className="card p-4 flex justify-between items-center hover:shadow-sm transition-shadow">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      <span className={`badge ${p.isAvailable ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                        {p.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{p.category} · ₹{p.price} · ~{p.preparationTime} min</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => toggleAvail(p._id)} className="btn-secondary text-xs py-1">
                      {p.isAvailable ? 'Disable' : 'Enable'}
                    </button>
                    <button onClick={() => startEdit(p)} className="btn-secondary text-xs py-1">Edit</button>
                    <button onClick={() => deleteProduct(p._id)} className="btn-danger text-xs py-1">Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

export default function AdminShops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [tab, setTab] = useState('pending');

  const fetchShops = () => {
    api.get('/admin/shops').then(r => setShops(r.data)).finally(() => setLoading(false));
  };
  useEffect(fetchShops, []);

  const act = async (id, action) => {
    setActing(id);
    try {
      await api.patch(`/admin/shops/${id}/${action}`);
      fetchShops();
    } catch {}
    setActing(null);
  };

  const filtered = shops.filter(s => tab === 'pending' ? !s.isApproved : s.isApproved);

  if (loading) return <Spinner />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Shops</h1>

      <div className="flex gap-2 mb-6">
        {[['pending', 'Pending Approval'], ['approved', 'Approved']].map(([val, label]) => (
          <button key={val} onClick={() => setTab(val)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              tab === val ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}>
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">🏪</p>
          <p>No {tab} shops.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(shop => (
            <div key={shop._id} className="card p-5 flex justify-between items-start hover:shadow-sm transition-shadow">
              <div>
                <p className="font-semibold text-gray-800">{shop.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  <span className="capitalize">{shop.category}</span> · {shop.location || 'No location'}
                </p>
                <p className="text-sm text-gray-500">Owner: {shop.owner?.name} ({shop.owner?.email})</p>
                {shop.description && <p className="text-sm text-gray-400 mt-1">{shop.description}</p>}
              </div>
              <div className="flex gap-2 ml-4 flex-shrink-0">
                {!shop.isApproved ? (
                  <button onClick={() => act(shop._id, 'approve')} disabled={acting === shop._id} className="btn-success text-sm">
                    {acting === shop._id ? '…' : '✓ Approve'}
                  </button>
                ) : (
                  <button onClick={() => act(shop._id, 'suspend')} disabled={acting === shop._id} className="btn-danger text-sm">
                    {acting === shop._id ? '…' : 'Suspend'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

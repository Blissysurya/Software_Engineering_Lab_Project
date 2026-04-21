import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const CATEGORIES = ['all', 'food', 'beverages', 'stationery', 'grocery', 'other'];

const CATEGORY_ICONS = { food: '🍱', beverages: '☕', stationery: '✏️', grocery: '🛍️', other: '📦', all: '🏪' };

const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));

export default function StudentHome() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/shops').then(r => setShops(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = shops.filter(s => {
    const matchCat = category === 'all' || s.category === category;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-1">What are you craving?</h1>
          <p className="text-orange-100 mb-5 text-sm">Order from campus shops, delivered to your hostel</p>
          <input
            className="w-full max-w-md px-4 py-2.5 rounded-xl text-gray-800 focus:outline-none shadow-md"
            placeholder="Search shops…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                category === c
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              <span>{CATEGORY_ICONS[c]}</span> {c}
            </button>
          ))}
        </div>

        {loading ? <Spinner /> : filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500">No shops found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(shop => (
              <Link key={shop._id} to={`/shops/${shop._id}`}
                className="card p-5 hover:shadow-md hover:border-orange-200 transition-all block group">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{CATEGORY_ICONS[shop.category] || '🏪'}</span>
                    <h2 className="font-semibold text-gray-800 text-base group-hover:text-orange-600 transition-colors">
                      {shop.name}
                    </h2>
                  </div>
                  <span className={`badge ${shop.isOpen ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {shop.isOpen ? 'Open' : 'Closed'}
                  </span>
                </div>
                <p className="text-gray-500 text-sm mb-3 line-clamp-2 pl-9">{shop.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm pl-9">
                  <span className="capitalize text-orange-600 font-medium">{shop.category}</span>
                  <span className="text-yellow-500">
                    {shop.totalReviews > 0 ? `${stars(shop.rating)} (${shop.totalReviews})` : 'No reviews'}
                  </span>
                </div>
                {shop.location && (
                  <p className="text-xs text-gray-400 mt-2 pl-9">📍 {shop.location}</p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

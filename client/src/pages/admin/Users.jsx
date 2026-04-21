import { useState, useEffect } from 'react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';

const ROLE_COLORS = {
  student: 'bg-blue-100 text-blue-700',
  vendor: 'bg-orange-100 text-orange-700',
  delivery: 'bg-cyan-100 text-cyan-700',
  admin: 'bg-purple-100 text-purple-700',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  useEffect(() => {
    api.get('/admin/users').then(r => setUsers(r.data)).finally(() => setLoading(false));
  }, []);

  const toggle = async id => {
    setActing(id);
    try {
      const { data } = await api.patch(`/admin/users/${id}/toggle`);
      setUsers(us => us.map(u => u._id === id ? data : u));
    } catch {}
    setActing(null);
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  if (loading) return <Spinner />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Manage Users</h1>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input className="input sm:w-64" placeholder="Search by name or email…" value={search}
          onChange={e => setSearch(e.target.value)} />
        <div className="flex gap-2 flex-wrap">
          {['all', 'student', 'vendor', 'delivery', 'admin'].map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                roleFilter === r ? 'bg-orange-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
              }`}>
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-orange-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Role</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">Joined</th>
              <th className="text-left px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(u => (
              <tr key={u._id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-800">{u.name}</td>
                <td className="px-4 py-3 text-gray-500">{u.email}</td>
                <td className="px-4 py-3"><span className={`badge ${ROLE_COLORS[u.role]}`}>{u.role}</span></td>
                <td className="px-4 py-3">
                  <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => toggle(u._id)} disabled={acting === u._id}
                    className={`text-xs px-2 py-1 rounded-md font-medium transition-colors ${
                      u.isActive
                        ? 'text-red-600 hover:bg-red-50 border border-red-200'
                        : 'text-green-600 hover:bg-green-50 border border-green-200'
                    }`}>
                    {acting === u._id ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-8">No users found.</p>
        )}
      </div>
    </div>
  );
}

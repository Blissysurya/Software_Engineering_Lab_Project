import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', phone: '', address: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === 'vendor') navigate('/vendor');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/shops');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-orange-600 to-orange-400 flex-col items-center justify-center p-12 text-white">
        <p className="text-6xl mb-5">🍽️</p>
        <h1 className="text-3xl font-bold mb-2">CampusEats</h1>
        <p className="text-orange-100 text-center text-sm leading-relaxed">
          Join thousands of students ordering from campus shops every day.
        </p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="card w-full max-w-md p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create account</h2>
          <p className="text-sm text-gray-500 mb-6">Join CampusEats today</p>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="input" required value={form.name} onChange={set('name')} placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input className="input" type="email" required value={form.email} onChange={set('email')} placeholder="you@campus.edu" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input className="input" type="password" required value={form.password} onChange={set('password')} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="student">Student</option>
                <option value="vendor">Shop Owner</option>
                <option value="delivery">Delivery Personnel</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input className="input" value={form.phone} onChange={set('phone')} placeholder="9876543210" />
            </div>
            {form.role === 'student' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hostel / Block Address</label>
                <input className="input" value={form.address} onChange={set('address')} placeholder="Block A, Room 201" />
              </div>
            )}
            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-5">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Mail, Lock, User, Phone, MapPin,
  AlertCircle, ArrowRight, Loader2, Check, Eye, EyeOff,
  GraduationCap, Store, Bike,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

function Field({ label, icon: Icon, children }) {
  return (
    <div className="auth-field space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10"
          />
        )}
        {children}
      </div>
    </div>
  );
}

const ROLES = [
  { value: 'student',  label: 'Student',  icon: GraduationCap, desc: 'Order from shops' },
  { value: 'vendor',   label: 'Vendor',   icon: Store,         desc: 'Run a shop' },
  { value: 'delivery', label: 'Delivery', icon: Bike,          desc: 'Deliver orders' },
];

function RolePicker({ value, onChange }) {
  return (
    <div className="auth-field space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
        I am a…
      </label>
      <div className="grid grid-cols-3 gap-2">
        {ROLES.map(({ value: v, label, icon: Icon, desc }) => {
          const active = value === v;
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center
                          transition-all duration-200 cursor-pointer
                          ${active
                            ? 'border-[hsl(var(--buffalo-sauce))] bg-[hsl(var(--buffalo-sauce)/0.06)] shadow-[0_0_0_3px_hsl(var(--buffalo-sauce)/0.12)]'
                            : 'border-gray-100 bg-gray-50 hover:border-gray-200 hover:bg-gray-100'
                          }`}
            >
              <Icon
                size={18}
                strokeWidth={2}
                className={active ? 'text-[hsl(var(--buffalo-sauce))]' : 'text-gray-400'}
              />
              <span className={`text-xs font-semibold leading-none ${active ? 'text-[hsl(var(--buffalo-sauce))]' : 'text-gray-700'}`}>
                {label}
              </span>
              <span className="text-[10px] text-gray-400 leading-tight">{desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Register() {
  const panelRef = useRef(null);
  const formRef  = useRef(null);

  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'student', phone: '', address: '',
  });
  const [error, setError]     = useState('');
  const [status, setStatus]   = useState('idle');
  const [showPass, setShowPass] = useState(false);

  const set = field => e => setForm(f => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.fromTo(panelRef.current,
        { x: -60, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.75 }
      )
      .fromTo('.auth-logo',
        { y: -20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5 }, 0.15
      )
      .fromTo('.auth-heading',
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55 }, 0.25
      )
      .fromTo('.auth-field',
        { y: 18, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.42, stagger: 0.08 }, 0.35
      )
      .fromTo('.auth-submit',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }, '-=0.1'
      )
      .fromTo('.auth-link',
        { opacity: 0 },
        { opacity: 1, duration: 0.35 }, '-=0.05'
      );
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (status === 'loading') return;
    setError('');
    setStatus('loading');
    try {
      const user = await register(form);
      setStatus('success');
      await new Promise(r => setTimeout(r, 700));
      if (user.role === 'vendor')        navigate('/vendor');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (user.role === 'admin')    navigate('/admin');
      else navigate('/shops');
    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      gsap.to(formRef.current, {
        keyframes: [
          { x: -10 }, { x: 10 }, { x: -7 }, { x: 7 }, { x: -3 }, { x: 0 },
        ],
        duration: 0.45,
        ease: 'power2.out',
      });
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">

      {/* ══ Left dark brand panel ═══════════════════════ */}
      <div
        ref={panelRef}
        className="hidden md:flex md:w-[42%] relative flex-col justify-between p-14 overflow-hidden"
        style={{ background: 'hsl(15 65% 7%)' }}
      >
        {/* Radial glow blobs */}
        <div
          className="absolute top-0 right-0 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, hsl(345 62% 43% / 0.28) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, hsl(15 80% 51% / 0.22) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-[45%] left-[30%] -translate-y-1/2 w-[180px] h-[180px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(50 55% 63% / 0.1) 0%, transparent 70%)' }}
        />

        {/* Logo */}
        <div className="auth-logo relative z-10 flex items-center gap-3">
          <span className="flex items-center justify-center w-11 h-11 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-sm">
            <UtensilsCrossed size={22} className="text-[hsl(var(--mustard-oil))]" strokeWidth={2} />
          </span>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Campus<span className="text-[hsl(var(--mustard-oil))]">Eats</span>
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10">
          <p className="text-[hsl(var(--mustard-oil))] text-[11px] font-bold uppercase tracking-[0.25em] mb-5">
            Join the Community
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-6">
            Join the<br />
            <span className="text-[hsl(var(--mustard-oil))]">campus</span><br />
            community.
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-[230px]">
            Whether you order, sell, or deliver — CampusEats connects everyone on campus.
          </p>
        </div>

        {/* Stats grid */}
        <div className="relative z-10 grid grid-cols-2 gap-2.5">
          {[
            { n: '500+', label: 'Students' },
            { n: '30+',  label: 'Shops' },
            { n: '1k+',  label: 'Orders' },
            { n: '4.8★', label: 'Avg Rating' },
          ].map(({ n, label }) => (
            <div key={label} className="rounded-xl bg-white/8 border border-white/10 px-3 py-2.5 text-center">
              <p className="font-display font-bold text-lg text-white">{n}</p>
              <p className="text-white/45 text-xs">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ Right white form panel (scrollable, no scrollbar) ═══ */}
      <div className="flex-1 overflow-y-auto scrollbar-none bg-white relative">
        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-[260px] h-[260px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, hsl(var(--mustard-oil)/0.07) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, hsl(var(--buffalo-sauce)/0.05) 0%, transparent 65%)' }}
        />

        <div className="min-h-full flex items-center justify-center p-8 py-12">
          <div ref={formRef} className="relative w-full max-w-[380px]">

            {/* Mobile logo */}
            <div className="auth-logo flex items-center gap-2.5 mb-8 md:hidden">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--buffalo-sauce))] shadow-md">
                <UtensilsCrossed size={20} className="text-white" strokeWidth={2} />
              </span>
              <span className="font-display font-bold text-xl text-[hsl(var(--red-chicory))]">CampusEats</span>
            </div>

            {/* Heading */}
            <div className="auth-heading mb-7">
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
                Create account
              </h1>
              <p className="text-gray-400 text-sm">
                Join CampusEats today — it&apos;s free.
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="slide-down flex items-start gap-2.5 px-4 py-3 mb-5 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle size={15} className="shrink-0 mt-0.5" strokeWidth={2} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" icon={User}>
                <input
                  required
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Rahul Sharma"
                  className="auth-input-clean has-icon"
                  disabled={status === 'loading'}
                />
              </Field>

              <Field label="Email address" icon={Mail}>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
                  placeholder="you@campus.edu"
                  className="auth-input-clean has-icon"
                  disabled={status === 'loading'}
                />
              </Field>

              <Field label="Password" icon={Lock}>
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={set('password')}
                  placeholder="••••••••"
                  className="auth-input-clean has-icon pr-11"
                  disabled={status === 'loading'}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
                </button>
              </Field>

              <RolePicker value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} />

              <Field label="Phone (optional)" icon={Phone}>
                <input
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="9876543210"
                  className="auth-input-clean has-icon"
                  disabled={status === 'loading'}
                />
              </Field>

              {form.role === 'student' && (
                <Field label="Hostel / Block Address" icon={MapPin}>
                  <input
                    value={form.address}
                    onChange={set('address')}
                    placeholder="Block A, Room 201"
                    className="auth-input-clean has-icon"
                    disabled={status === 'loading'}
                  />
                </Field>
              )}

              <div className="auth-submit pt-1">
                <button
                  type="submit"
                  disabled={status !== 'idle'}
                  className={`relative w-full h-12 rounded-xl text-white text-sm font-semibold
                              flex items-center justify-center gap-2 overflow-hidden
                              transition-all duration-300 active:scale-[0.98] disabled:cursor-not-allowed
                              ${status === 'success'
                                ? 'bg-emerald-500'
                                : status === 'loading'
                                ? 'btn-shimmer'
                                : 'bg-gradient-to-r from-[hsl(var(--red-chicory))] to-[hsl(var(--buffalo-sauce))] hover:brightness-110 hover:shadow-[0_6px_24px_hsl(var(--buffalo-sauce)/0.4)]'
                              }`}
                >
                  {status === 'idle' && (
                    <>Create account <ArrowRight size={15} strokeWidth={2.5} /></>
                  )}
                  {status === 'loading' && (
                    <><Loader2 size={17} strokeWidth={2.5} className="animate-spin" /> Creating account…</>
                  )}
                  {status === 'success' && (
                    <span className="check-pop flex items-center gap-2">
                      <Check size={18} strokeWidth={2.5} /> Success! Redirecting…
                    </span>
                  )}
                </button>
              </div>
            </form>

            <p className="auth-link text-sm text-center text-gray-400 mt-7">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-semibold text-[hsl(var(--buffalo-sauce))] hover:underline underline-offset-2"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

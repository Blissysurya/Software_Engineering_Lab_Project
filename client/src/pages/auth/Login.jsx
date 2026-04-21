import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Mail, Lock, AlertCircle,
  ArrowRight, Loader2, Check, Eye, EyeOff,
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

export default function Login() {
  const wrapRef  = useRef(null);
  const panelRef = useRef(null);
  const formRef  = useRef(null);
  const btnRef   = useRef(null);

  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [status, setStatus]   = useState('idle');
  const [showPass, setShowPass] = useState(false);

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
        { y: 0, opacity: 1, duration: 0.45, stagger: 0.1 }, 0.38
      )
      .fromTo('.auth-submit',
        { y: 12, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.4 }, 0.65
      )
      .fromTo('.auth-link',
        { opacity: 0 },
        { opacity: 1, duration: 0.35 }, 0.78
      );
  }, []);

  const handleSubmit = async e => {
    e.preventDefault();
    if (status === 'loading') return;
    setError('');
    setStatus('loading');

    try {
      const user = await login(form.email, form.password);
      setStatus('success');
      await new Promise(r => setTimeout(r, 700));
      if (user.role === 'vendor')        navigate('/vendor');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (user.role === 'admin')    navigate('/admin');
      else navigate('/shops');
    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
    <div ref={wrapRef} className="h-screen flex overflow-hidden">

      {/* ══ Left dark brand panel ═══════════════════════ */}
      <div
        ref={panelRef}
        className="hidden md:flex md:w-[46%] relative flex-col justify-between p-14 overflow-hidden"
        style={{ background: 'hsl(345 65% 7%)' }}
      >
        {/* Radial glow blobs */}
        <div
          className="absolute top-0 right-0 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, hsl(15 80% 51% / 0.28) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[320px] h-[320px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, hsl(345 62% 43% / 0.22) 0%, transparent 65%)' }}
        />
        <div
          className="absolute top-1/2 left-[35%] -translate-y-1/2 w-[200px] h-[200px] rounded-full pointer-events-none"
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
            Campus Food Platform
          </p>
          <h2 className="font-display text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-6">
            Hunger<br />
            solved.<br />
            <span className="text-[hsl(var(--mustard-oil))]">Instantly.</span>
          </h2>
          <p className="text-white/40 text-sm leading-relaxed max-w-[240px]">
            Order meals from campus shops and get them delivered straight to your hostel.
          </p>
        </div>

        {/* Feature list */}
        <div className="relative z-10 space-y-3">
          {[
            { icon: '⚡', text: 'Fast campus delivery' },
            { icon: '🏪', text: 'All campus shops in one place' },
            { icon: '📍', text: 'Live order tracking' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 text-white/55 text-sm">
              <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/8 border border-white/10 text-base shrink-0">
                {icon}
              </span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ══ Right white form panel ══════════════════════ */}
      <div className="flex-1 flex items-center justify-center bg-white relative p-8">
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-[280px] h-[280px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, hsl(var(--mustard-oil)/0.07) 0%, transparent 65%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[200px] h-[200px] pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, hsl(var(--buffalo-sauce)/0.05) 0%, transparent 65%)' }}
        />

        <div ref={formRef} className="relative w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="auth-logo flex items-center gap-2.5 mb-10 md:hidden">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--buffalo-sauce))] shadow-md">
              <UtensilsCrossed size={20} className="text-white" strokeWidth={2} />
            </span>
            <span className="font-display font-bold text-xl text-[hsl(var(--red-chicory))]">CampusEats</span>
          </div>

          {/* Heading */}
          <div className="auth-heading mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-2">
              Welcome back
            </h1>
            <p className="text-gray-400 text-sm">
              Sign in to continue ordering from campus.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="slide-down flex items-start gap-2.5 px-4 py-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Email address" icon={Mail}>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
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
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
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

            <div className="auth-submit pt-1">
              <button
                ref={btnRef}
                type="submit"
                disabled={status !== 'idle'}
                className={`relative w-full h-12 rounded-xl text-white text-sm font-semibold
                            flex items-center justify-center gap-2 overflow-hidden
                            transition-all duration-300 active:scale-[0.98]
                            disabled:cursor-not-allowed
                            ${status === 'success'
                              ? 'bg-emerald-500'
                              : status === 'loading'
                              ? 'btn-shimmer'
                              : 'bg-gradient-to-r from-[hsl(var(--red-chicory))] to-[hsl(var(--buffalo-sauce))] hover:brightness-110 hover:shadow-[0_6px_24px_hsl(var(--buffalo-sauce)/0.4)]'
                            }`}
              >
                {status === 'idle' && (
                  <>Sign in <ArrowRight size={15} strokeWidth={2.5} /></>
                )}
                {status === 'loading' && (
                  <><Loader2 size={17} strokeWidth={2.5} className="animate-spin" /> Signing in…</>
                )}
                {status === 'success' && (
                  <span className="check-pop flex items-center gap-2">
                    <Check size={18} strokeWidth={2.5} /> Redirecting…
                  </span>
                )}
              </button>
            </div>
          </form>

          <p className="auth-link text-sm text-center text-gray-400 mt-8">
            Don&apos;t have an account?{' '}
            <Link
              to="/register"
              className="font-semibold text-[hsl(var(--buffalo-sauce))] hover:underline underline-offset-2"
            >
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Mail, Lock, AlertCircle,
  ArrowRight, Loader2, Check, Eye, EyeOff,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import gsap from 'gsap';

/* ── Animated field wrapper ─────────────────────── */
function Field({ label, icon: Icon, children }) {
  return (
    <div className="auth-field space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            size={15}
            strokeWidth={2}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70 pointer-events-none z-10"
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
  const [status, setStatus]   = useState('idle'); // idle | loading | success
  const [showPass, setShowPass] = useState(false);

  /* ── Entrance animation ─────────────────────── */
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

  /* ── Submit ─────────────────────────────────── */
  const handleSubmit = async e => {
    e.preventDefault();
    if (status === 'loading') return;
    setError('');
    setStatus('loading');

    try {
      const user = await login(form.email, form.password);
      setStatus('success');
      await new Promise(r => setTimeout(r, 700)); // show check icon briefly
      if (user.role === 'vendor')        navigate('/vendor');
      else if (user.role === 'delivery') navigate('/delivery');
      else if (user.role === 'admin')    navigate('/admin');
      else navigate('/shops');
    } catch (err) {
      setStatus('idle');
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      /* shake the form */
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
    <div ref={wrapRef} className="min-h-screen flex overflow-hidden">

      {/* ══ Left brand panel ════════════════════════════ */}
      <div
        ref={panelRef}
        className="hidden md:flex md:w-[46%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, hsl(345 62% 30%) 0%, hsl(345 62% 43%) 50%, hsl(15 80% 44%) 100%)' }}
      >
        {/* Animated ring decoration */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="spin-slow w-[420px] h-[420px] rounded-full border border-white/8"
            style={{ borderStyle: 'dashed' }}
          />
          <div className="spin-rev absolute w-[320px] h-[320px] rounded-full border border-white/10" />
          <div className="absolute w-[200px] h-[200px] rounded-full bg-white/5" />
        </div>

        {/* Floating food blobs */}
        <div className="auth-float-a absolute top-[18%] right-[12%] w-16 h-16 rounded-2xl bg-[hsl(var(--mustard-oil)/0.25)] border border-[hsl(var(--mustard-oil)/0.3)] flex items-center justify-center text-2xl shadow-lg">
          🍜
        </div>
        <div className="auth-float-b absolute bottom-[28%] right-[8%] w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-2xl shadow-lg">
          ☕
        </div>
        <div className="auth-float-c absolute top-[52%] right-[22%] w-12 h-12 rounded-xl bg-[hsl(var(--buffalo-sauce)/0.3)] border border-[hsl(var(--buffalo-sauce)/0.4)] flex items-center justify-center text-xl shadow-lg">
          🥗
        </div>
        <div className="auth-float-a absolute bottom-[14%] left-[12%] w-10 h-10 rounded-xl bg-white/8 border border-white/15 flex items-center justify-center text-lg" style={{ animationDelay: '2s' }}>
          🧃
        </div>

        {/* Logo */}
        <div className="auth-logo relative z-10 flex items-center gap-3">
          <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 border border-white/25 shadow-lg backdrop-blur-sm">
            <UtensilsCrossed size={24} className="text-white" strokeWidth={2} />
          </span>
          <span className="font-display font-bold text-2xl text-white tracking-tight">
            Campus<span className="text-[hsl(var(--mustard-oil))]">Eats</span>
          </span>
        </div>

        {/* Headline */}
        <div className="relative z-10">
          <h2 className="font-display text-5xl font-bold text-white leading-[1.1] mb-5">
            Good food,<br />
            <span className="text-[hsl(var(--mustard-oil))]">great</span><br />
            campus life.
          </h2>
          <p className="text-white/55 text-sm leading-relaxed max-w-[260px]">
            Order meals, beverages, and essentials from your campus shops — delivered right to you.
          </p>
        </div>

        {/* Feature bullets */}
        <div className="relative z-10 space-y-2">
          {[
            { icon: '⚡', text: 'Fast delivery to your hostel' },
            { icon: '🏪', text: 'Dozens of campus shops' },
            { icon: '📱', text: 'Real-time order tracking' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-2.5 text-white/70 text-sm">
              <span className="text-base">{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ══ Right form panel ════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-background" />
        <div
          className="absolute inset-0 opacity-40"
          style={{ backgroundImage: 'radial-gradient(circle at 70% 30%, hsl(var(--mustard-oil) / 0.15) 0%, transparent 60%)' }}
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
            <h1 className="font-display text-[2.2rem] font-bold text-[hsl(var(--red-chicory))] leading-tight mb-1.5">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to continue ordering from campus.
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="slide-down flex items-start gap-2.5 px-4 py-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              <AlertCircle size={15} className="shrink-0 mt-0.5" strokeWidth={2} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <Field label="Email address" icon={Mail}>
              <input
                type="email"
                required
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@campus.edu"
                className="auth-input has-icon"
                disabled={status === 'loading'}
              />
            </Field>

            {/* Password */}
            <Field label="Password" icon={Lock}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                className="auth-input has-icon pr-11"
                disabled={status === 'loading'}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-foreground transition-colors"
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={15} strokeWidth={2} /> : <Eye size={15} strokeWidth={2} />}
              </button>
            </Field>

            {/* Submit */}
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
                              : 'bg-gradient-to-r from-[hsl(var(--red-chicory))] to-[hsl(var(--buffalo-sauce))] hover:brightness-110 hover:shadow-lg'
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

          {/* Switch link */}
          <p className="auth-link text-sm text-center text-muted-foreground mt-8">
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

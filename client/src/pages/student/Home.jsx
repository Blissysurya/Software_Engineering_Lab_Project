import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, Star, Coffee, UtensilsCrossed,
  PenLine, ShoppingBag, Box, Store, ChevronRight,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import useScrollReveal from '../../hooks/useScrollReveal';
import gsap from 'gsap';

const CATEGORIES = ['all', 'food', 'beverages', 'stationery', 'grocery', 'other'];

const CAT_META = {
  all:        { icon: Store,          label: 'All' },
  food:       { icon: UtensilsCrossed, label: 'Food' },
  beverages:  { icon: Coffee,          label: 'Beverages' },
  stationery: { icon: PenLine,         label: 'Stationery' },
  grocery:    { icon: ShoppingBag,     label: 'Grocery' },
  other:      { icon: Box,             label: 'Other' },
};

function StarRating({ rating, count }) {
  const full = Math.round(rating);
  return (
    <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
      <Star size={11} fill="currentColor" strokeWidth={0} />
      {Number(rating).toFixed(1)}
      <span className="text-muted-foreground font-normal">({count})</span>
    </span>
  );
}

export default function StudentHome() {
  const heroRef  = useRef(null);
  const pageRef  = useRef(null);
  const [shops, setShops]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch]   = useState('');

  useEffect(() => {
    api.get('/shops').then(r => setShops(r.data)).finally(() => setLoading(false));
  }, []);

  /* Hero entrance animation */
  useEffect(() => {
    if (!heroRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo('.hero-title',
        { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', delay: 0.1 }
      );
      gsap.fromTo('.hero-sub',
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out', delay: 0.28 }
      );
      gsap.fromTo('.hero-search',
        { opacity: 0, y: 16, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.42 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  useScrollReveal(pageRef);

  const filtered = shops.filter(s => {
    const matchCat = category === 'all' || s.category === category;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div>
      {/* ── Hero ────────────────────────────────────────── */}
      <div ref={heroRef} className="brand-hero relative overflow-hidden">
        {/* decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/10 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="hero-sub text-[hsl(var(--mustard-oil))] text-sm font-semibold uppercase tracking-widest mb-3 opacity-0">
            Campus Food Delivery
          </p>
          <h1 className="hero-title font-display text-4xl sm:text-5xl font-bold text-white leading-tight mb-4 opacity-0">
            What are you<br />craving today?
          </h1>
          <p className="hero-sub text-white/70 text-sm mb-8 opacity-0">
            Order from campus shops — delivered to your hostel door.
          </p>

          {/* Search bar */}
          <div className="hero-search opacity-0 relative max-w-lg">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search shops…"
              className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-white text-foreground text-sm shadow-lg
                         placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[hsl(var(--mustard-oil))]"
            />
          </div>
        </div>
      </div>

      {/* ── Content ─────────────────────────────────────── */}
      <div ref={pageRef} className="max-w-6xl mx-auto px-4 sm:px-6 py-10">

        {/* Category pills */}
        <div className="flex gap-2 flex-wrap mb-8" data-reveal>
          {CATEGORIES.map(c => {
            const { icon: Icon, label } = CAT_META[c];
            const active = category === c;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium
                            transition-all duration-150 border ${
                  active
                    ? 'bg-[hsl(var(--red-chicory))] text-white border-transparent shadow-sm'
                    : 'bg-card text-muted-foreground border-border hover:border-[hsl(var(--mustard-oil))] hover:text-foreground'
                }`}
              >
                <Icon size={13} strokeWidth={2} />
                {label}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading ? (
          <Spinner />
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Search size={40} className="mx-auto mb-4 text-muted-foreground/40" />
            <p className="text-muted-foreground">No shops found.</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-muted-foreground mb-4" data-reveal>
              {filtered.length} shop{filtered.length !== 1 ? 's' : ''} found
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-reveal>
              {filtered.map(shop => {
                const { icon: CatIcon } = CAT_META[shop.category] || CAT_META.other;
                return (
                  <Link
                    key={shop._id}
                    to={`/shops/${shop._id}`}
                    className="card-hover group flex flex-col p-5 gap-3"
                  >
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center justify-center w-10 h-10 rounded-xl
                                         bg-[hsl(var(--breezy-beige))] border border-border shrink-0">
                          <CatIcon size={18} className="text-chicory" strokeWidth={1.8} />
                        </span>
                        <div>
                          <h2 className="font-semibold text-card-foreground text-[15px] leading-snug
                                         group-hover:text-[hsl(var(--buffalo-sauce))] transition-colors">
                            {shop.name}
                          </h2>
                          <span className="text-xs capitalize text-muted-foreground">{shop.category}</span>
                        </div>
                      </div>
                      <span className={shop.isOpen ? 'badge-open' : 'badge-closed'}>
                        {shop.isOpen ? 'Open' : 'Closed'}
                      </span>
                    </div>

                    {/* Description */}
                    {shop.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {shop.description}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-auto pt-1 border-t border-border/60">
                      {shop.location ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin size={11} strokeWidth={2} />
                          {shop.location}
                        </span>
                      ) : <span />}
                      <div className="flex items-center gap-2">
                        {shop.totalReviews > 0 && (
                          <StarRating rating={shop.rating} count={shop.totalReviews} />
                        )}
                        <ChevronRight size={14} className="text-muted-foreground/50 group-hover:text-[hsl(var(--buffalo-sauce))] transition-colors" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

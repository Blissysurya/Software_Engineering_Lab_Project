import { useState, useEffect, useRef } from 'react';
import {
  Truck, MapPin, RefreshCw, Package, CheckCircle2,
  ClipboardList, Navigation,
} from 'lucide-react';
import api from '../../api/axios';
import Spinner from '../../components/Spinner';
import useScrollReveal from '../../hooks/useScrollReveal';

const STATUS_BADGE = {
  picked_up: 'badge-picked_up',
  delivered: 'badge-delivered',
};

export default function DeliveryDashboard() {
  const pageRef = useRef(null);
  const [available, setAvailable]     = useState([]);
  const [myDeliveries, setMyDeliveries] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [acting, setActing]           = useState(null);
  const [tab, setTab]                 = useState('available');
  const [refreshing, setRefreshing]   = useState(false);

  const fetchData = async () => {
    const [a, m] = await Promise.all([
      api.get('/delivery/available'),
      api.get('/delivery/my'),
    ]);
    setAvailable(a.data);
    setMyDeliveries(m.data);
  };

  useEffect(() => { fetchData().finally(() => setLoading(false)); }, []);
  useScrollReveal(pageRef);

  const refresh = async () => {
    setRefreshing(true);
    await fetchData().catch(() => {});
    setRefreshing(false);
  };

  const assign = async orderId => {
    setActing(orderId);
    try { await api.post(`/delivery/assign/${orderId}`); await fetchData(); } catch {}
    setActing(null);
  };

  const deliver = async orderId => {
    setActing(orderId);
    try { await api.patch(`/delivery/deliver/${orderId}`); await fetchData(); } catch {}
    setActing(null);
  };

  const active = myDeliveries.filter(o => o.status === 'picked_up');

  if (loading) return <Spinner />;

  return (
    <div ref={pageRef} className="max-w-3xl mx-auto px-4 sm:px-6 py-10">

      {/* Header */}
      <div className="flex items-center justify-between mb-8" data-reveal>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[hsl(var(--red-chicory)/0.1)]">
            <Truck size={20} className="text-[hsl(var(--red-chicory))]" strokeWidth={2} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-[hsl(var(--red-chicory))]">Delivery Dashboard</h1>
            <p className="text-muted-foreground text-xs mt-0.5">Manage your active deliveries</p>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="flex items-center gap-1.5 btn-outline text-xs h-9 px-3"
        >
          <RefreshCw size={13} strokeWidth={2} className={refreshing ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Active delivery banner */}
      {active.length > 0 && (
        <div className="mb-6 rounded-xl border border-[hsl(var(--buffalo-sauce)/0.3)] bg-[hsl(var(--buffalo-sauce)/0.06)] p-5" data-reveal>
          <h2 className="flex items-center gap-2 font-semibold text-[hsl(var(--buffalo-sauce))] mb-3 text-sm">
            <Navigation size={15} strokeWidth={2} /> Active Delivery
          </h2>
          {active.map(o => (
            <div key={o._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <p className="font-semibold text-card-foreground">{o.shop?.name}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                  <MapPin size={11} strokeWidth={2} />
                  Deliver to: {o.student?.address || o.student?.name}
                </p>
                <p className="text-sm font-bold text-card-foreground mt-1">₹{o.totalAmount}</p>
              </div>
              <button
                onClick={() => deliver(o._id)}
                disabled={acting === o._id}
                className="btn-primary text-xs h-9 px-4 gap-1.5 self-start sm:self-center"
              >
                <CheckCircle2 size={14} strokeWidth={2} />
                {acting === o._id ? 'Updating…' : 'Mark Delivered'}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6" data-reveal>
        {[
          { key: 'available', label: 'Available', count: available.length },
          { key: 'history',   label: 'History',   count: null },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === key
                ? 'bg-[hsl(var(--red-chicory))] text-white shadow-sm'
                : 'bg-card text-muted-foreground border border-border hover:border-[hsl(var(--mustard-oil))] hover:text-foreground'
            }`}
          >
            {label}
            {count !== null && count > 0 && (
              <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${
                tab === key ? 'bg-white/20 text-white' : 'bg-[hsl(var(--buffalo-sauce))] text-white'
              }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Available orders */}
      {tab === 'available' && (
        available.length === 0 ? (
          <div className="text-center py-20">
            <Truck size={44} className="mx-auto mb-4 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="font-display text-lg font-semibold text-foreground mb-1">No orders available</p>
            <p className="text-muted-foreground text-sm">Check back soon for new delivery requests.</p>
          </div>
        ) : (
          <div className="space-y-4" data-reveal>
            {available.map(o => (
              <div key={o._id} className="card p-5 hover:shadow-card-md transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-semibold text-card-foreground">{o.shop?.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                      <MapPin size={11} strokeWidth={2} />{o.shop?.location}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-card-foreground shrink-0">₹{o.totalAmount}</span>
                </div>

                <div className="bg-muted/30 rounded-lg px-3 py-2 text-xs text-muted-foreground mb-3">
                  <p className="font-medium text-foreground/80 mb-0.5">Deliver to:</p>
                  <p>{o.student?.address || o.student?.name}</p>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  {o.items.map(i => `${i.name} ×${i.quantity}`).join(' · ')}
                </p>

                <button
                  onClick={() => assign(o._id)}
                  disabled={acting === o._id}
                  className="btn-primary text-xs h-9 px-4 gap-1.5 w-full sm:w-auto"
                >
                  <Truck size={13} strokeWidth={2} />
                  {acting === o._id ? 'Assigning…' : 'Pick Up This Order'}
                </button>
              </div>
            ))}
          </div>
        )
      )}

      {/* History */}
      {tab === 'history' && (
        myDeliveries.length === 0 ? (
          <div className="text-center py-20">
            <ClipboardList size={44} className="mx-auto mb-4 text-muted-foreground/30" strokeWidth={1.5} />
            <p className="font-display text-lg font-semibold text-foreground mb-1">No history yet</p>
            <p className="text-muted-foreground text-sm">Your completed deliveries will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2.5" data-reveal>
            {myDeliveries.map(o => (
              <div key={o._id} className="card flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted shrink-0">
                    <Package size={16} className="text-muted-foreground" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-card-foreground truncate">{o.shop?.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(o.updatedAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-sm text-card-foreground mb-1">₹{o.totalAmount}</p>
                  <span className={STATUS_BADGE[o.status] || 'badge'}>
                    {o.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}

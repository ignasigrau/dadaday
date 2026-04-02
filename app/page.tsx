"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, CheckCircle, Loader2, Activity } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { db } from './lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, increment } from 'firebase/firestore';

export default function DadadayPage() {
  const [status, setStatus] = useState<'loading' | 'idle' | 'form' | 'success'>('loading');
  const [stats, setStats] = useState<any>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const docRef = doc(db, "config", "tickets");
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setStats(docSnap.data());
        setStatus('idle');
      } catch (e) { console.error(e); setStatus('idle'); }
    };
    fetchStats();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setStatus('loading');
    try {
      await addDoc(collection(db, "asistentes"), { email, ticketType: selectedId, fecha: new Date().toISOString() });
      await updateDoc(doc(db, "config", "tickets"), { [`${selectedId}_sold`]: increment(1) });
      confetti({ particleCount: 200, spread: 80, colors: ['#00ff00', '#ffffff', '#222222'] });
      setStatus('success');
    } catch (error) { setStatus('idle'); }
  };

  if (status === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono italic text-zinc-500">
      LOADING_SYSTEM...
    </div>
  );

  if (status === 'success') return (
    <div className="min-h-screen bg-black text-green-500 flex flex-col items-center justify-center p-6 text-center font-mono">
      <div className="border-2 border-green-500 p-10 uppercase tracking-[0.5em] leading-loose">
        <h1 className="text-4xl font-black mb-4">ACCESS_GRANTED</h1>
        <p className="text-zinc-400 text-sm">TICKET_SENT_TO: <br/>{email}</p>
        <p className="mt-8 text-[10px] animate-pulse text-zinc-600">KEEP_THIS_DIGITAL_PASS_READY</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100 font-mono selection:bg-green-500 selection:text-black">

      {/* BACKGROUND GRAIN OVERLAY */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]"></div>

      <header className="max-w-2xl mx-auto pt-24 pb-16 px-6 relative">
        <div className="absolute top-10 left-6 text-[10px] text-zinc-700 tracking-tighter">
          SYSTEM_VERSION: 2.0.26 // B-DAY_EDITION
        </div>

        <h1 className="text-8xl font-black tracking-tighter leading-none mb-6 break-all">
          DADA<span className="text-zinc-800">DAY</span>
          <span className="text-green-500 animate-pulse">_</span>
        </h1>

        <div className="flex flex-col gap-2 text-[11px] font-bold uppercase tracking-widest text-zinc-400 border-l border-zinc-800 pl-4 mt-8">
          <div className="flex items-center gap-3"><Calendar size={12} className="text-zinc-600"/> DATE: 12_04_2026</div>
          <div className="flex items-center gap-3"><MapPin size={12} className="text-zinc-600"/> LOC: BARCELONA</div>
          <div className="flex items-center gap-3 text-green-800"><Activity size={12}/> BPM: 145_STEADY</div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-32 relative">
        <div className="bg-zinc-900/20 border-y border-zinc-800 py-2 mb-10 overflow-hidden whitespace-nowrap">
          <div className="animate-marquee inline-block text-[10px] text-zinc-600 tracking-[0.5em]">
             TICKETS_AVAILABLE // NO_REFUNDS // ONLY_TECHNO // DADADAY_B-DAY_PROJECT //
          </div>
        </div>

        <div className="grid gap-2">
          {[
            { id: 'early', name: '001_EARLY_ACCESS', sold: stats?.early_sold, total: stats?.early_total },
            { id: 'first', name: '002_MAIN_RELEASE', sold: stats?.first_sold, total: stats?.first_total },
            { id: 'last', name: '003_FINAL_CALL', sold: stats?.last_sold, total: stats?.last_total },
          ].map((t) => {
            const isSoldOut = (t.sold || 0) >= (t.total || 0);
            return (
              <button
                key={t.id}
                disabled={isSoldOut}
                onClick={() => { setSelectedId(t.id); setStatus('form'); }}
                className={`group relative p-6 border transition-all text-left flex justify-between items-center ${
                  isSoldOut
                  ? 'border-zinc-900 bg-transparent opacity-20'
                  : 'border-zinc-800 bg-zinc-900/30 hover:bg-white hover:text-black hover:border-white'
                }`}
              >
                <div>
                  <p className="text-[14px] font-black tracking-tighter">{t.name}</p>
                  <p className="text-[10px] mt-1 opacity-60 uppercase">{isSoldOut ? 'STATUS: SOLD_OUT' : 'STATUS: AVAILABLE'}</p>
                </div>
                <div className="text-xl font-black">[00,00€]</div>
              </button>
            );
          })}
        </div>

        {status === 'form' && (
          <form onSubmit={handleBooking} className="mt-16 border-2 border-white p-8 bg-black animate-in fade-in zoom-in-95">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tighter italic underline decoration-2">Input_User_Data:</h3>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL_ADDRESS"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-none p-4 text-white mb-6 outline-none focus:border-green-500 font-mono text-sm"
            />
            <button className="w-full bg-white text-black font-black py-4 rounded-none uppercase tracking-[0.3em] text-xs hover:bg-green-500 transition-colors">
              CONFIRM_RESERVATION
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
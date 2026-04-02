"use client";
import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, CheckCircle, Loader2 } from 'lucide-react';
// @ts-ignore
import confetti from 'canvas-confetti';
import { db } from './lib/firebase';
import { doc, getDoc, updateDoc, collection, addDoc, increment } from 'firebase/firestore';

interface TicketStats {
  early_sold: number; early_total: number;
  first_sold: number; first_total: number;
  last_sold: number; last_total: number;
}

export default function DadadayPage() {
  const [status, setStatus] = useState<'loading' | 'idle' | 'form' | 'success'>('loading');
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail] = useState('');

  // 1. Leer stock de Firebase al cargar
  useEffect(() => {
    const fetchStats = async () => {
      const docRef = doc(db, "config", "tickets");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setStats(docSnap.data() as TicketStats);
      }
      setStatus('idle');
    };
    fetchStats();
  }, []);

  const handleBooking = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!selectedId || !stats) return;
  setStatus('loading');

  try {
    // 1. Guardar en Firebase (lo que ya tenías)
    await addDoc(collection(db, "asistentes"), {
      email,
      ticketType: selectedId,
      fecha: new Date().toISOString()
    });

    await updateDoc(doc(db, "config", "tickets"), {
      [`${selectedId}_sold`]: increment(1)
    });

    // 2. NUEVO: Enviar el email mediante nuestra API
    await fetch('/api/send', {
      method: 'POST',
      body: JSON.stringify({ email, ticketType: selectedId }),
    });

    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    setStatus('success');
  } catch (error) {
    console.error("Error:", error);
    alert("Hubo un error al reservar.");
    setStatus('idle');
  }
};

  if (status === 'loading') return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <Loader2 className="animate-spin text-white" size={40} />
    </div>
  );

  const ticketOptions = [
    { id: 'early', name: 'Early Bird', desc: 'Los más rápidos', sold: stats?.early_sold, total: stats?.early_total },
    { id: 'first', name: 'First Release', desc: 'Entrada General', sold: stats?.first_sold, total: stats?.first_total },
    { id: 'last', name: 'Last Release', desc: 'Última oportunidad', sold: stats?.last_sold, total: stats?.last_total },
  ];

  if (status === 'success') return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <CheckCircle size={80} className="text-white mb-6 animate-pulse" />
      <h1 className="text-5xl font-black mb-4 tracking-tighter italic">DADADAY CONFIRMADO</h1>
      <p className="text-zinc-400">Te esperamos. Tu entrada llegará a <b>{email}</b></p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans p-6">
      <header className="max-w-xl mx-auto pt-16 pb-12 text-center">
        <h1 className="text-7xl font-black tracking-tighter italic mb-4">DADA<span className="text-zinc-700">DAY</span></h1>
        <div className="flex justify-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          <span className="flex items-center gap-2"><Calendar size={12}/> 15 JUN</span>
          <span className="flex items-center gap-2"><MapPin size={12}/> MADRID</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto space-y-4">
        {ticketOptions.map((t) => {
          const isSoldOut = (t.sold || 0) >= (t.total || 0);
          return (
            <button
              key={t.id}
              disabled={isSoldOut}
              onClick={() => { setSelectedId(t.id); setStatus('form'); }}
              className={`w-full p-6 rounded-xl border text-left flex justify-between items-center transition-all ${
                isSoldOut ? 'opacity-30 grayscale border-zinc-900' : 'bg-zinc-900/50 border-zinc-800 hover:border-white'
              }`}
            >
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{t.name}</p>
                <p className="text-xl font-bold">{t.desc}</p>
                {isSoldOut && <span className="text-[9px] font-black bg-zinc-800 px-2 py-0.5 rounded">SOLD OUT</span>}
              </div>
              <div className="text-xl font-black italic">0€</div>
            </button>
          );
        })}

        {status === 'form' && (
          <form onSubmit={handleBooking} className="mt-12 p-8 bg-white text-black rounded-2xl animate-in fade-in slide-in-from-bottom-4">
            <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-4 text-center">Finalizar Reserva</h3>
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Escribe tu email"
              className="w-full bg-zinc-100 border-none rounded-lg p-4 text-black mb-4 outline-none focus:ring-2 focus:ring-zinc-400"
            />
            <button className="w-full bg-black text-white font-black py-5 rounded-lg uppercase tracking-widest text-xs hover:scale-105 transition-transform">
              Obtener Ticket {selectedId?.toUpperCase()}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
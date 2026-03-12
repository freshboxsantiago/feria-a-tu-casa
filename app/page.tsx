"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPaymentPreference } from './actions';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COMUNAS = ["Providencia", "Ñuñoa", "Las Condes", "Vitacura", "Santiago Centro", "Maipú", "La Florida"];

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [selectedComuna, setSelectedComuna] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const MY_PHONE = "56999303808"; 

  useEffect(() => {
    async function init() {
      // Get Products
      const { data: prodData } = await supabase.from('products').select('*').eq('active', true);
      if (prodData) setProducts(prodData);
      
      // Get Session
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      setLoading(false);
    }
    init();
  }, []);

  const addToCart = (product: any) => setCart([...cart, product]);
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price_clp, 0);

  const handleWhatsAppCheckout = () => {
    if (!selectedComuna) return alert("Por favor, selecciona tu comuna.");
    const itemsText = cart.map(item => `- ${item.name}`).join('%0A');
    const msg = `Hola! Pedido desde ${selectedComuna}:%0A${itemsText}%0ATotal: $${total.toLocaleString('es-CL')}`;
    window.open(`https://wa.me/${MY_PHONE}?text=${msg}`, '_blank');
    router.push('/success');
  };

  const handleMPCheckout = async () => {
    if (!selectedComuna) return alert("Selecciona tu comuna primero.");
    setIsPaying(true);
    try {
      const url = await createPaymentPreference(cart);
      if (url) window.location.href = url;
    } catch (err) {
      alert("Error con Mercado Pago. Intenta WhatsApp.");
    } finally {
      setIsPaying(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.refresh();
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-green-600 italic animate-pulse">Cargando Feria...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
      {/* --- MAIN CONTENT (LEFT) --- */}
      <main className="flex-grow p-6 md:p-12 order-2 md:order-1">
        <header className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-4xl font-black text-green-900 italic">Feria a tu Casa 🇨🇱</h1>
            <p className="text-gray-500 font-medium">De La Vega a tu mesa.</p>
          </div>
          
          {/* USER NAV */}
          <div className="flex gap-2">
            {user ? (
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-gray-400 uppercase">Bienvenido</span>
                <button onClick={handleLogout} className="text-xs font-bold text-red-500 underline">Cerrar Sesión</button>
              </div>
            ) : (
              <Link href="/register" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md">
                Iniciar Sesión / Registro
              </Link>
            )}
          </div>
        </header>

        {/* INSTRUCTIONS */}
        <section className="bg-white p-6 rounded-3xl border border-gray-100 mb-10 shadow-sm max-w-2xl">
          <h2 className="font-black text-gray-800 mb-2">¿Cómo funciona? 🛒</h2>
          <p className="text-sm text-gray-500 leading-relaxed">
            Agrega productos a tu canasto. Cuando estés listo, revisa el total a la derecha, elige tu comuna y selecciona tu método de pago preferido.
          </p>
        </section>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-[2.5rem] p-4 border border-gray-100 shadow-sm hover:shadow-md transition">
              <div className="h-40 bg-gray-50 rounded-[2rem] mb-4 flex items-center justify-center text-4xl overflow-hidden">
                {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : "🥦"}
              </div>
              <h3 className="font-bold text-gray-800 px-2">{p.name}</h3>
              <p className="text-[10px] text-gray-400 px-2 uppercase font-black">{p.unit}</p>
              <div className="flex justify-between items-center mt-4 bg-gray-50 p-3 rounded-2xl">
                <span className="font-black text-green-700">${p.price_clp.toLocaleString('es-CL')}</span>
                <button onClick={() => addToCart(p)} className="bg-green-600 text-white w-10 h-10 rounded-xl font-bold hover:bg-green-700 shadow-sm active:scale-90 transition">+</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- CART SIDEBAR (RIGHT) --- */}
      <aside className="w-full md:w-[400px] bg-white border-l p-8 flex flex-col shadow-2xl md:sticky md:top-0 md:h-screen order-1 md:order-2">
        <h2 className="text-2xl font-black text-gray-900 mb-8 tracking-tighter italic">Resumen del Pedido</h2>

        <div className="mb-6">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Despacho en Santiago</label>
          <select 
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            className="w-full p-4 bg-gray-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-green-500 transition"
          >
            <option value="">Selecciona tu comuna...</option>
            {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.length === 0 ? (
            <div className="text-center opacity-30 mt-20">
              <span className="text-5xl block mb-2">🥕</span>
              <p className="text-xs font-bold uppercase">Canasto Vacío</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-50 p-4 rounded-2xl border border-gray-100 group animate-in slide-in-from-right-4">
                <div>
                  <p className="text-sm font-bold text-gray-700">{item.name}</p>
                  <p className="text-xs text-green-600 font-black">${item.price_clp.toLocaleString('es-CL')}</p>
                </div>
                <button onClick={() => removeFromCart(idx)} className="text-gray-300 hover:text-red-500 font-bold p-2">✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-6 border-t border-gray-100 space-y-3">
            <div className="flex justify-between items-end mb-4 px-2">
              <button onClick={() => setCart([])} className="text-[10px] text-red-400 font-black uppercase hover:underline">Limpiar</button>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-black">Total a pagar</span>
                <span className="text-3xl font-black text-green-800">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button 
              onClick={handleMPCheckout}
              disabled={isPaying || !selectedComuna}
              className={`w-full py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${
                !selectedComuna ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isPaying ? "Cargando Mercado Pago..." : "Pagar con Tarjeta"}
            </button>

            <button 
              onClick={handleWhatsAppCheckout}
              className={`w-full py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                !selectedComuna ? 'border-gray-100 text-gray-300' : 'border-green-500 text-green-600 hover:bg-green-50'
              }`}
            >
              Pedir por WhatsApp ➔
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
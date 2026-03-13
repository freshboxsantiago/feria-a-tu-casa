"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createPaymentPreference } from './actions';
import Link from 'next/link';
import { sendOrderEmail } from './email-action';
import ProductReviews from '@/components/ProductReviews';

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

  // El número ahora viene del archivo .env.local
  const MY_PHONE = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER; 

  useEffect(() => {
    async function init() {
      // 1. Cargar Productos
      const { data: prodData } = await supabase
        .from('products')
        .select('*')
        .eq('active', true)
        .order('is_base_box', { ascending: false });
      if (prodData) setProducts(prodData);
      
      // 2. Cargar Sesión y Perfil (Auto-comuna)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        const { data: profile } = await supabase
          .from('profiles')
          .select('comuna')
          .eq('id', session.user.id)
          .single();
        
        if (profile?.comuna) setSelectedComuna(profile.comuna);
      }
      
      setLoading(false);
    }
    init();
  }, []);

  // --- ACTIONS ---
  const addToCart = (product: any) => {
    setCart((prevCart) => [...prevCart, product]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price_clp, 0);

  const handleWhatsAppCheckout = async () => {
  if (!selectedComuna) return alert("Por favor, selecciona tu comuna.");
  
  // 1. Enviar Email (Si el usuario está logueado)
  if (user?.email) {
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    await sendOrderEmail(cart, total, user.email, profile);
  }

  // 2. Abrir WhatsApp
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-white text-green-600 font-black italic text-2xl animate-pulse">FRESHBOX...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#FBFBFD] text-[#1D1D1F]">
      
      {/* --- PRODUCT FEED (LEFT) --- */}
      <main className="flex-grow p-6 md:p-12 order-2 md:order-1 lg:max-w-6xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <h1 className="text-5xl font-black tracking-tighter text-green-900 italic">Feria a tu Casa</h1>
            <p className="text-gray-400 font-medium">Calidad de Lo Valledor, en tu puerta.</p>
          </div>
          
          <nav className="flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
            {user ? (
              <>
                <Link href="/profile" className="px-4 py-2 text-sm font-bold text-green-700 hover:bg-green-50 rounded-xl transition">Mi Perfil 👤</Link>
                <button onClick={() => supabase.auth.signOut().then(() => window.location.reload())} className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-red-500 transition">Salir</button>
              </>
            ) : (
              <Link href="/register" className="px-6 py-2 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-black transition shadow-lg">Entrar / Registro</Link>
            )}
          </nav>
        </header>

        {/* HERO INSTRUCTIONS */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-600 to-green-800 rounded-[3rem] p-8 md:p-12 mb-12 text-white shadow-2xl shadow-green-200">
          <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-black mb-4 text-white">¿Cómo comprar? 🛒</h2>
            <p className="text-green-50 opacity-90 leading-relaxed mb-6 font-medium">
              1. Selecciona tu caja base. 2. Agrega extras. 3. Elige tu comuna a la derecha y paga como prefieras. ¡Despachamos frescura total!
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </section>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="group bg-white rounded-[2.5rem] p-5 border border-transparent hover:border-green-100 hover:shadow-2xl transition-all duration-500 flex flex-col">
              <div className="relative aspect-square bg-gray-50 rounded-[2rem] mb-6 overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">🍏</div>
                )}
              </div>
              
              {/* ... dentro del map de productos ... */}
<div className="px-2 mb-4">
  <h3 className="font-black text-xl text-gray-800 mb-1">{p.name}</h3>
  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{p.unit}</p>
  <p className="text-sm text-gray-500 leading-snug mb-4">{p.description}</p>
  
  {/* AGREGAMOS EL COMPONENTE DE REVIEWS AQUÍ */}
  <ProductReviews productId={p.id} user={user} />
  
  {p.stock <= 5 && p.stock > 0 && <p className="text-red-500 text-[10px] font-bold mt-2 uppercase italic">¡Solo {p.stock} disponibles!</p>}
</div>

              <div className="mt-auto flex items-center justify-between bg-gray-50 p-4 rounded-[1.8rem] group-hover:bg-green-50 transition-colors">
                <span className="font-black text-2xl text-gray-900 italic">${p.price_clp.toLocaleString('es-CL')}</span>
                <button 
                  onClick={() => addToCart(p)}
                  disabled={p.stock === 0}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border transition-all active:scale-90 ${
                    p.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-900 hover:bg-green-600 hover:text-white border-gray-100'
                  }`}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- CART SIDEBAR (RIGHT) --- */}
      <aside className="w-full md:w-[420px] bg-white/80 backdrop-blur-xl border-l border-gray-100 p-8 flex flex-col md:sticky md:top-0 md:h-screen order-1 md:order-2 z-20">
        <h2 className="text-3xl font-black italic tracking-tighter mb-10">Mi Canasto</h2>

        <div className="mb-8">
          <label className="text-[10px] font-black text-gray-300 uppercase tracking-[0.2em] mb-3 block">Comuna de Entrega</label>
          <select 
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            className="w-full p-5 bg-white border border-gray-100 rounded-[1.5rem] text-sm font-bold shadow-sm focus:ring-4 focus:ring-green-100 outline-none transition-all cursor-pointer"
          >
            <option value="">Selecciona tu comuna...</option>
            {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {user && selectedComuna && <p className="text-[10px] text-green-600 font-bold mt-2 ml-2 italic">✓ Cargada desde tu perfil</p>}
        </div>

        <div className="flex-grow overflow-y-auto space-y-4 mb-8">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20 py-20 text-center">
              <p className="font-black uppercase text-xs tracking-widest italic">Tu canasto está vacío</p>
            </div>
          ) : (
            cart.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-50 shadow-sm">
                <div>
                  <p className="text-sm font-black text-gray-800">{item.name}</p>
                  <p className="text-xs text-green-600 font-bold">${item.price_clp.toLocaleString('es-CL')}</p>
                </div>
                <button onClick={() => removeFromCart(idx)} className="w-8 h-8 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 transition">✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="pt-8 border-t border-gray-100 space-y-4">
            <div className="flex justify-between items-end mb-4">
              <button onClick={() => setCart([])} className="text-[10px] text-gray-300 font-black uppercase hover:text-red-500 transition tracking-widest">Vaciar</button>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block uppercase font-black tracking-widest">Total CLP</span>
                <span className="text-4xl font-black text-green-800 italic">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <button 
              onClick={handleMPCheckout}
              disabled={!selectedComuna || isPaying}
              className={`w-full py-5 rounded-[2rem] font-black text-lg shadow-xl transition-all ${
                !selectedComuna ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
              }`}
            >
              {isPaying ? "Conectando..." : "Pago con Tarjeta"}
            </button>

            <button 
              onClick={handleWhatsAppCheckout}
              className={`w-full py-5 rounded-[2rem] font-black text-lg transition-all border-2 ${
                !selectedComuna ? 'border-gray-100 text-gray-200' : 'border-green-600 text-green-600 hover:bg-green-50 active:scale-95'
              }`}
            >
              Pedir vía WhatsApp ➔
            </button>
          </div>
        )}
      </aside>
      {user?.email === 'freshboxsantiago@gmail.com' && (
  <footer className="p-10 text-center">
    <Link 
      href="/admin" 
      className="text-[10px] font-black uppercase text-gray-300 hover:text-green-500 transition tracking-[0.3em]"
    >
      — Acceso Panel de Control —
    </Link>
  </footer>
)}
    </div>
  );
}
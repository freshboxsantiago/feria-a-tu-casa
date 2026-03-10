"use client";

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COMUNAS = ["Providencia", "Ñuñoa", "Las Condes", "Vitacura", "Santiago Centro", "Maipú", "La Florida"];

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [selectedComuna, setSelectedComuna] = useState("");
  const [loading, setLoading] = useState(true);

  const MY_PHONE = "569XXXXXXXX"; // Reemplaza con tu número real

  useEffect(() => {
    async function getProducts() {
      const { data } = await supabase.from('products').select('*').eq('active', true);
      if (data) setProducts(data);
      setLoading(false);
    }
    getProducts();
  }, []);

  const addToCart = (product: any) => setCart([...cart, product]);
  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const total = cart.reduce((acc, item) => acc + item.price_clp, 0);

  const generateWhatsAppLink = () => {
    const itemsText = cart.map(item => `- ${item.name}`).join('%0A');
    const msg = `Hola! Quiero pedir desde ${selectedComuna}:%0A${itemsText}%0ATotal: $${total.toLocaleString('es-CL')}`;
    return `https://wa.me/${MY_PHONE}?text=${msg}`;
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-green-600">Cargando la feria...</div>;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      
      {/* --- LEFT SIDE: PRODUCTS & INSTRUCTIONS --- */}
      <main className="flex-grow p-6 md:p-12 order-2 md:order-1">
        <header className="mb-8">
          <h1 className="text-4xl font-black text-green-900 italic">Feria a tu Casa 🇨🇱</h1>
          <p className="text-gray-500 font-medium mt-2">Fruta y verdura seleccionada de La Vega.</p>
        </header>

        {/* Instructions Card */}
        <section className="bg-green-50 p-6 rounded-3xl border border-green-100 mb-10 max-w-3xl">
          <h2 className="text-lg font-bold text-green-800 mb-2">¿Cómo comprar? 🛒</h2>
          <p className="text-sm text-green-900/70 leading-relaxed">
            Es muy fácil: navega por los productos y presiona <strong>"+"</strong> para agregarlos a tu canasto. 
            En la barra lateral (a la derecha) verás tu resumen. Selecciona tu comuna y finaliza enviando un 
            <strong> WhatsApp</strong> para coordinar la entrega y el pago por transferencia.
          </p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:shadow-md transition">
              <div className="w-full h-44 bg-gray-50 rounded-2xl mb-4 overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🍎</div>
                )}
              </div>
              <h3 className="font-bold text-gray-800">{product.name}</h3>
              <p className="text-[10px] text-gray-400 uppercase font-black mb-4 tracking-tighter">{product.unit}</p>
              <div className="mt-auto w-full flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="font-black text-green-700 text-lg">${product.price_clp.toLocaleString('es-CL')}</span>
                <button 
                  onClick={() => addToCart(product)}
                  className="bg-green-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-green-700 active:scale-90 transition shadow-sm"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* --- RIGHT SIDE: CART & CHECKOUT --- */}
      <aside className="w-full md:w-[380px] bg-white border-l p-6 flex flex-col shadow-2xl md:sticky md:top-0 md:h-screen order-1 md:order-2">
        <h2 className="text-2xl font-black text-gray-800 mb-6">Tu Pedido 🧺</h2>

        <div className="mb-6">
          <label className="text-[10px] font-black uppercase text-gray-400 block mb-2 tracking-widest">Comuna de Entrega</label>
          <select 
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none"
          >
            <option value="">Selecciona...</option>
            {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex-grow overflow-y-auto space-y-3 mb-6 pr-2">
          {cart.length === 0 ? (
            <p className="text-center text-gray-400 text-sm mt-10 italic">Tu canasto está vacío...</p>
          ) : (
            cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100 group animate-in slide-in-from-right-2">
                <div>
                  <p className="text-sm font-bold text-gray-700">{item.name}</p>
                  <p className="text-[10px] text-green-600 font-bold">${item.price_clp.toLocaleString('es-CL')}</p>
                </div>
                <button onClick={() => removeFromCart(index)} className="text-gray-300 hover:text-red-500 p-1">✕</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="border-t pt-6 space-y-3">
            <div className="flex justify-between items-end mb-4">
              <button onClick={() => setCart([])} className="text-[10px] text-gray-400 hover:text-red-400 font-bold uppercase transition">Vaciar</button>
              <div className="text-right">
                <span className="text-xs text-gray-400 block uppercase font-black">Total CLP</span>
                <span className="text-3xl font-black text-green-700">${total.toLocaleString('es-CL')}</span>
              </div>
            </div>

            <a 
              href={selectedComuna ? generateWhatsAppLink() : "#"} 
              target="_blank"
              className={`block w-full text-center py-4 rounded-2xl font-black text-lg transition-all shadow-lg ${
                !selectedComuna ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600 active:scale-95'
              }`}
            >
              Pedir por WhatsApp ➔
            </a>
            
            <button disabled className="w-full bg-blue-50 text-blue-300 py-3 rounded-xl font-bold text-sm cursor-not-allowed border border-blue-100">
              Pago con Tarjeta (Próximamente)
            </button>
          </div>
        )}

        <div className="mt-6 border-t pt-6">
           <a 
            href={`https://wa.me/${MY_PHONE}?text=Hola! Tengo una duda sobre los productos o pedidos mayoristas.`}
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition border border-dashed border-gray-300"
          >
            <span className="text-2xl">🚛</span>
            <div className="leading-tight">
              <p className="text-[10px] font-black uppercase text-gray-400">¿Dudas o Mayoreo?</p>
              <p className="text-xs font-bold text-gray-600">Háblame aquí directo</p>
            </div>
          </a>
        </div>
      </aside>
    </div>
  );
}
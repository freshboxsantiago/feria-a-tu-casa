"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({ name: '', price_clp: 0, unit: '', description: '', image_url: '', stock: 0, active: true });

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false });
    if (data) setProducts(data);
    setLoading(false);
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('products').insert([newProduct]);
    if (error) alert(error.message);
    else {
      alert("¡Producto agregado!");
      setNewProduct({ name: '', price_clp: 0, unit: '', description: '', image_url: '', stock: 0, active: true });
      fetchProducts();
    }
  };

  const updateStock = async (id: string, newStock: number) => {
    await supabase.from('products').update({ stock: newStock }).eq('id', id);
    fetchProducts();
  };

  if (loading) return <div className="p-20 text-center font-black text-green-600 italic">FRESHBOX ADMIN...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* NAVEGACIÓN ADMIN */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-black italic text-gray-800 tracking-tighter">Gestión de Productos 📦</h1>
          </div>
          <div className="flex gap-3">
            <Link href="/admin" className="px-6 py-3 bg-white border border-gray-200 rounded-2xl font-bold text-sm hover:shadow-md transition">
              👥 Ver Clientes
            </Link>
            <Link href="/" className="px-6 py-3 bg-gray-900 text-white rounded-2xl font-bold text-sm shadow-lg transition">
              🏠 Volver a la Tienda
            </Link>
          </div>
        </header>

        {/* FORMULARIO AGREGAR */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-100 mb-12">
          <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Nombre" className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} required />
            <input type="number" placeholder="Precio" className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={newProduct.price_clp || ''} onChange={e => setNewProduct({...newProduct, price_clp: Number(e.target.value)})} required />
            <input type="number" placeholder="Stock Inicial" className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} required />
            <textarea placeholder="Descripción" className="p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-bold md:col-span-3 h-20" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
            <button className="md:col-span-3 bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 shadow-lg transition">Guardar Producto</button>
          </form>
        </div>

        {/* LISTADO CON STOCK */}
        <div className="grid grid-cols-1 gap-4">
          {products.map(p => (
            <div key={p.id} className="bg-white p-6 rounded-[2rem] flex flex-col md:flex-row items-center justify-between border border-gray-100 shadow-sm gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl overflow-hidden">
                  {p.image_url ? <img src={p.image_url} className="w-full h-full object-cover" /> : "🥦"}
                </div>
                <div>
                  <h3 className="font-bold text-gray-800">{p.name}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{p.unit}</p>
                </div>
              </div>

              {/* CONTROL DE STOCK RÁPIDO */}
              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl">
                <span className="text-[10px] font-black uppercase text-gray-400 italic">Stock:</span>
                <input 
                  type="number" 
                  defaultValue={p.stock} 
                  onBlur={(e) => updateStock(p.id, Number(e.target.value))}
                  className="w-16 bg-transparent font-black text-center text-green-700 outline-none"
                />
              </div>

              <div className="flex items-center gap-6">
                <span className="font-black text-xl text-gray-800">${p.price_clp.toLocaleString('es-CL')}</span>
                <button onClick={async () => { if(confirm("¿Eliminar?")) await supabase.from('products').delete().eq('id', p.id); fetchProducts(); }} className="text-red-300 hover:text-red-500 font-bold text-xs uppercase transition">Eliminar</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
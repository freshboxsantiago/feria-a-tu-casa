"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Traemos todos los perfiles de la base de datos
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProfiles(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-20 text-center font-black">Accediendo al Panel de Control...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black italic text-green-400">Panel Admin 🚀</h1>
          <p className="text-gray-400">Gestión de Clientes y Repartos</p>
        </div>
        <Link href="/" className="bg-gray-800 px-4 py-2 rounded-xl text-sm font-bold border border-gray-700">Salir</Link>
      </header>

      <div className="max-w-6xl mx-auto bg-gray-800 rounded-[2rem] overflow-hidden border border-gray-700 shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-700/50 text-[10px] uppercase tracking-widest font-black text-gray-400">
              <th className="p-5">Cliente</th>
              <th className="p-5">RUT / Teléfono</th>
              <th className="p-5">Comuna</th>
              <th className="p-5">Dirección</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {profiles.map((p) => (
              <tr key={p.id} className="hover:bg-gray-750 transition text-sm">
                <td className="p-5">
                  <p className="font-bold text-green-400">{p.full_name || "Sin nombre"}</p>
                  <p className="text-[10px] text-gray-500">Registrado el {new Date(p.created_at).toLocaleDateString()}</p>
                </td>
                <td className="p-5 italic text-gray-300">
                  {p.rut || "No RUT"} <br/>
                  <span className="text-green-500 font-bold">{p.phone}</span>
                </td>
                <td className="p-5">
                  <span className="bg-green-900/30 text-green-400 px-3 py-1 rounded-full font-black text-[10px]">
                    {p.comuna || "No definida"}
                  </span>
                </td>
                <td className="p-5 text-gray-400 max-w-xs truncate">
                  {p.address || "Dirección pendiente"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {profiles.length === 0 && (
          <div className="p-20 text-center text-gray-500 font-bold">Aún no hay clientes registrados.</div>
        )}
      </div>
    </div>
  );
  // ... (mismo código de antes)
<header className="max-w-6xl mx-auto mb-10 flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-black italic text-green-400">Clientes Registrados 👥</h1>
  </div>
  <div className="flex gap-4">
    <Link href="/admin/products" className="bg-green-600 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg hover:bg-green-700 transition">
      📦 Gestionar Productos
    </Link>
    <Link href="/" className="bg-gray-800 px-6 py-3 rounded-2xl text-sm font-bold border border-gray-700">
      Salir
    </Link>
  </div>
</header>
// ...
}
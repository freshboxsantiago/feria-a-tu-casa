"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Importación necesaria para el redireccionamiento
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define aquí tu correo maestro para centralizarlo
const MASTER_EMAIL = "freshboxsantiago@gmail.com"; 

export default function AdminPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAuthAndFetch() {
      // 1. Verificar sesión
      const { data: { session } } = await supabase.auth.getSession();

      // 2. Si no hay sesión o el correo no es el maestro, redirigir
      if (!session || session.user.email !== MASTER_EMAIL) {
        router.push('/register');
        return;
      }

      // 3. Si todo está ok, traer los perfiles
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) setProfiles(data);
      setLoading(false);
    }
    
    checkAuthAndFetch();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-green-400 font-black text-xl animate-pulse italic tracking-tighter">
        VERIFICANDO CREDENCIALES...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6 md:p-12 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-4xl font-black italic text-green-400 tracking-tighter">Panel Admin 👥</h1>
          <p className="text-gray-400 font-medium">Gestión de Clientes y Repartos</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <Link 
            href="/admin/products" 
            className="flex-1 md:flex-none text-center bg-green-600 px-6 py-3 rounded-2xl text-sm font-black shadow-lg hover:bg-green-700 transition active:scale-95"
          >
            📦 GESTIONAR PRODUCTOS
          </Link>
          <Link 
            href="/" 
            className="flex-1 md:flex-none text-center bg-gray-800 px-6 py-3 rounded-2xl text-sm font-black border border-gray-700 hover:bg-gray-700 transition"
          >
            VOLVER A TIENDA
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto bg-gray-800 rounded-[2.5rem] overflow-hidden border border-gray-700 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-700/50 text-[10px] uppercase tracking-[0.2em] font-black text-gray-400">
                <th className="p-6">Cliente</th>
                <th className="p-6">Contacto / RUT</th>
                <th className="p-6">Ubicación</th>
                <th className="p-6">Dirección Detallada</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {profiles.map((p) => (
                <tr key={p.id} className="hover:bg-gray-750 transition-colors">
                  <td className="p-6">
                    <p className="font-black text-lg text-white">{p.full_name || "Sin nombre"}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                      Socio desde: {new Date(p.created_at).toLocaleDateString('es-CL')}
                    </p>
                  </td>
                  <td className="p-6 italic">
                    <p className="text-green-400 font-black">{p.phone || "Sin Teléfono"}</p>
                    <p className="text-xs text-gray-400">{p.rut || "RUT pendiente"}</p>
                  </td>
                  <td className="p-6">
                    <span className="bg-green-900/40 text-green-400 px-4 py-1.5 rounded-full font-black text-[10px] border border-green-800/50">
                      {p.comuna || "POR DEFINIR"}
                    </span>
                  </td>
                  <td className="p-6 text-gray-400 text-sm leading-relaxed max-w-xs">
                    {p.address || <span className="text-gray-600 italic">No registrada</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {profiles.length === 0 && (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="text-6xl mb-4">🏪</div>
            <p className="text-gray-500 font-black uppercase tracking-widest text-sm">Aún no hay clientes registrados en la base de datos</p>
          </div>
        )}
      </div>

      <footer className="mt-12 text-center">
        <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.5em]">FreshBox Dashboard v1.0 — 2026</p>
      </footer>
    </div>
  );
}
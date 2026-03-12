"use client";
import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const COMUNAS = ["Providencia", "Ñuñoa", "Las Condes", "Vitacura", "Santiago Centro", "Maipú", "La Florida"];

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    full_name: '',
    rut: '',
    phone: '',
    comuna: '',
    address: ''
  });
  const router = useRouter();

  useEffect(() => {
    async function getProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/register');
        return;
      }

      // Fetch profile data from our 'profiles' table
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) setProfile(data);
      setLoading(false);
    }
    getProfile();
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: session?.user.id,
        ...profile,
        updated_at: new Date(),
      });

    if (error) alert("Error actualizando: " + error.message);
    else alert("¡Perfil actualizado con éxito! ✨");
  };

  if (loading) return <div className="p-10 text-center font-bold">Cargando tu perfil...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-xl mx-auto bg-white rounded-[2.5rem] shadow-xl p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="text-sm font-bold text-green-600">← Volver a la feria</Link>
          <h1 className="text-2xl font-black text-gray-800 italic">Mi Perfil 👤</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Nombre Completo</label>
            <input 
              type="text" value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition"
              placeholder="Ej: Juan Pérez" required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">RUT</label>
              <input 
                type="text" value={profile.rut} 
                onChange={(e) => setProfile({...profile, rut: e.target.value})}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition"
                placeholder="12.345.678-9"
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 ml-2">WhatsApp</label>
              <input 
                type="text" value={profile.phone} 
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition"
                placeholder="+569..."
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Comuna de Despacho</label>
            <select 
              value={profile.comuna}
              onChange={(e) => setProfile({...profile, comuna: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition font-bold"
            >
              <option value="">Selecciona tu comuna...</option>
              {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 ml-2">Dirección Exacta</label>
            <textarea 
              value={profile.address} 
              onChange={(e) => setProfile({...profile, address: e.target.value})}
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition h-24"
              placeholder="Calle, Número, Departamento / Block"
            />
          </div>

          <button className="w-full bg-gray-900 text-white py-4 rounded-2xl font-black text-lg hover:bg-green-600 transition shadow-xl mt-4">
            Guardar mis datos
          </button>
        </form>
      </div>
    </div>
  );
}
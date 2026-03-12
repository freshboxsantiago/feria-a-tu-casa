"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName } // Esto guarda el nombre en los metadatos
      }
    });

    if (error) alert(error.message);
    else {
      alert("¡Cuenta creada! Ahora puedes comprar más rápido.");
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-3xl shadow-lg max-w-sm w-full space-y-4">
        <h2 className="text-2xl font-black text-gray-800">Crea tu cuenta</h2>
        <input 
          type="text" placeholder="Nombre completo" 
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setFullName(e.target.value)} required
        />
        <input 
          type="email" placeholder="Tu Email" 
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setEmail(e.target.value)} required
        />
        <input 
          type="password" placeholder="Contraseña" 
          className="w-full p-3 border rounded-xl"
          onChange={(e) => setPassword(e.target.value)} required
        />
        <button className="w-full bg-green-600 text-white py-3 rounded-xl font-bold">Registrarse</button>
      </form>
    </div>
  );
}
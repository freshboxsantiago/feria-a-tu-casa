"use client";
import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true); // Controla si es Login o Registro
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const router = useRouter();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Lógica de INICIO DE SESIÓN
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Error: " + error.message);
      else router.push('/');
    } else {
      // Lógica de REGISTRO
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      });
      if (error) alert("Error: " + error.message);
      else {
        alert("¡Cuenta creada con éxito!");
        router.push('/');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl max-w-sm w-full border border-gray-100">
        <h2 className="text-3xl font-black text-gray-800 mb-2 italic">
          {isLogin ? "¡Hola de nuevo! 👋" : "Crea tu cuenta ✨"}
        </h2>
        <p className="text-gray-400 text-sm mb-8 font-medium">
          {isLogin ? "Entra para comprar más rápido." : "Regístrate para guardar tu dirección."}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          {!isLogin && (
            <input 
              type="text" placeholder="Nombre completo" 
              className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition outline-none"
              onChange={(e) => setFullName(e.target.value)} required
            />
          )}
          <input 
            type="email" placeholder="Email" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition outline-none"
            onChange={(e) => setEmail(e.target.value)} required
          />
          <input 
            type="password" placeholder="Contraseña" 
            className="w-full p-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-green-500 transition outline-none"
            onChange={(e) => setPassword(e.target.value)} required
          />
          <button className="w-full bg-green-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-green-700 transition active:scale-95">
            {isLogin ? "Entrar" : "Crear Cuenta"}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-xs font-bold text-gray-400 hover:text-green-600 transition uppercase tracking-widest"
        >
          {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Entra aquí"}
        </button>
      </div>
    </div>
  );
}
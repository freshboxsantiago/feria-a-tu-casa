"use client";
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export default function ProductReviews({ productId, user }: { productId: string, user: any }) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    const { data } = await supabase
      .from('reviews')
      .select('*, profiles(full_name)')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });
    if (data) setReviews(data);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return alert("Debes iniciar sesión para comentar");

    const { error } = await supabase.from('reviews').insert([
      { product_id: productId, user_id: user.id, rating, comment }
    ]);

    if (!error) {
      setComment('');
      fetchReviews();
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Reseñas de Clientes</h4>
      
      {/* Lista de comentarios */}
      <div className="space-y-3 mb-4 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
        {reviews.length === 0 && <p className="text-[10px] italic text-gray-300">Sé el primero en calificar...</p>}
        {reviews.map((rev, i) => (
          <div key={i} className="bg-gray-50 p-2 rounded-xl text-[11px]">
            <div className="flex justify-between">
              <span className="font-bold text-gray-700">{rev.profiles?.full_name || "Cliente"}</span>
              <span className="text-yellow-500">{"★".repeat(rev.rating)}</span>
            </div>
            <p className="text-gray-500 italic">"{rev.comment}"</p>
          </div>
        ))}
      </div>

      {/* Formulario (Solo si está logueado) */}
      {user && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button 
                key={num} type="button" 
                onClick={() => setRating(num)}
                className={`text-lg ${rating >= num ? 'text-yellow-400' : 'text-gray-200'}`}
              >
                ★
              </button>
            ))}
          </div>
          <input 
            type="text" 
            placeholder="Escribe un comentario..." 
            className="text-[10px] p-2 bg-white border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-green-400"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <button className="bg-gray-900 text-white text-[9px] font-black py-1 rounded-lg uppercase tracking-tighter">Publicar</button>
        </form>
      )}
    </div>
  );
}
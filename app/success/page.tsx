"use client";
import Link from 'next/link';

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="bg-white max-w-md w-full rounded-3xl p-8 shadow-xl text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-black text-gray-800 mb-2">¡Pedido enviado!</h1>
        <p className="text-gray-600 mb-6">
          Ya recibí tu mensaje. Te contactaré por WhatsApp en breve para confirmar la hora de entrega y los datos de transferencia.
        </p>
        <div className="bg-gray-50 p-4 rounded-2xl mb-6 text-left">
          <p className="text-xs font-bold text-gray-400 uppercase">Siguiente paso:</p>
          <p className="text-sm text-gray-700">Revisa tu WhatsApp, te enviaré el total final con el costo de envío (si aplica).</p>
        </div>
        <Link 
          href="/" 
          className="block w-full bg-green-600 text-white py-4 rounded-2xl font-bold hover:bg-green-700 transition"
        >
          Volver a la feria
        </Link>
      </div>
    </div>
  );
}
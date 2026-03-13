"use server";
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(cart: any[], total: number, customerEmail: string, addressData: any) {
  try {
    const itemsHtml = cart.map(item => `<li>${item.name} - $${item.price_clp.toLocaleString('es-CL')}</li>`).join('');
    
    await resend.emails.send({
      from: 'Feria a tu Casa <onboarding@resend.dev>', // Luego puedes usar tu propio dominio
      to: [customerEmail, 'tu-email@gmail.com'], // Copia para ti
      subject: 'Confirmación de tu pedido - Feria a tu Casa',
      html: `
        <h1>¡Gracias por tu pedido!</h1>
        <p>Estamos preparando tus productos para el despacho en <strong>${addressData.comuna}</strong>.</p>
        <hr />
        <h3>Resumen:</h3>
        <ul>${itemsHtml}</ul>
        <p><strong>Total: $${total.toLocaleString('es-CL')}</strong></p>
        <p><strong>Dirección:</strong> ${addressData.address}</p>
        <p>Nos contactaremos contigo vía WhatsApp para coordinar la entrega.</p>
      `
    });
  } catch (error) {
    console.error("Error enviando email:", error);
  }
}
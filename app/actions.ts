"use server";
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN || 'APP_USR-445818493353663-030922-fe2af32d0b84d5120dc3c305a3ae26e3-387248407' 
});

export async function createPaymentPreference(items: any[]) {
  const preference = new Preference(client);
  const result = await preference.create({
    body: {
      items: items.map(item => ({
        id: item.id,
        title: item.name,
        quantity: 1,
        unit_price: item.price_clp,
        currency_id: 'CLP',
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/success`,
      },
      auto_return: 'approved',
    }
  });
  return result.init_point;
}
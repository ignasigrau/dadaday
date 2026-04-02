import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, ticketType } = await req.json();

    const data = await resend.emails.send({
      from: 'DADADAY <onboarding@resend.dev>', // Luego podrás poner tu dominio si quieres
      to: [email],
      subject: '🎟️ TU ENTRADA PARA EL DADADAY',
      html: `
        <div style="font-family: sans-serif; background: #000; color: #fff; padding: 40px; border-radius: 20px; text-align: center;">
          <h1 style="font-style: italic; letter-spacing: -2px; font-size: 40px;">DADA<span style="color: #444;">DAY</span></h1>
          <p style="text-transform: uppercase; letter-spacing: 2px; font-size: 12px; color: #888;">Confirmación de Reserva</p>
          <hr style="border: 1px dashed #333; margin: 20px 0;">
          <h2 style="margin: 0;">TIPO: ${ticketType.toUpperCase()}</h2>
          <p style="font-size: 18px;">Lugar: Madrid (Secreto)</p>
          <p style="font-size: 18px;">Fecha: 15 de Junio</p>
          <div style="margin-top: 30px; border: 2px solid #fff; padding: 10px; display: inline-block;">
             <p style="margin: 0; font-weight: bold;">CÓDIGO QR PENDIENTE</p>
          </div>
          <p style="margin-top: 40px; font-size: 10px; color: #444;">Presenta este email en la puerta.</p>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error });
  }
}
import { NextResponse } from "next/server";
import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set. Please configure this environment variable.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

interface LineItem {
  name: string;
  price: number;
  qty: number;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body as { items: LineItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Nieprawidłowa lista produktów." }, { status: 400 });
    }

    for (const item of items) {
      if (
        typeof item.name !== "string" ||
        !item.name.trim() ||
        typeof item.price !== "number" ||
        item.price <= 0 ||
        typeof item.qty !== "number" ||
        item.qty < 1 ||
        !Number.isInteger(item.qty)
      ) {
        return NextResponse.json({ error: "Nieprawidłowe dane produktu." }, { status: 400 });
      }
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map((item) => ({
      price_data: {
        currency: "pln",
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.qty,
    }));

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/checkout/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/checkout/cancel`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json(
      { error: "Nie udało się utworzyć sesji płatności. Spróbuj ponownie." },
      { status: 500 }
    );
  }
}

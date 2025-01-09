import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
        apiVersion: "2024-12-18.acacia",
    });

    const signature = req.headers.get("stripe-signature") || "";
    const rawBody = await req.text(); // JSONではなく生テキストで読む必要がある点に注意

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            rawBody,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error("Webhook Error:", err);
        return NextResponse.json(
            { error: "Webhook Signature Verification Failed" },
            { status: 400 }
        );
    }

    // イベントの種類に応じて処理
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;
            // DB更新などをここに実装
            break;
        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
}

"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const product = {
  id: "1",
  name: "Complete UI Kit",
  description:
    "A comprehensive collection of 200+ professionally designed UI components.",
  price: 500, // INR
  creator: "John Doe",
};

export default function ProductSalesPage() {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (loading) return; // 🔒 double-click protection

    try {
      setLoading(true);

      // 1️⃣ Create Razorpay order (server)
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Order creation failed");
      }

      const order = await res.json();

      if (!order?.id) {
        throw new Error("Invalid order response");
      }

      // 2️⃣ Ensure Razorpay key exists
      const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!razorpayKey) {
        throw new Error("Razorpay key missing");
      }

      // 3️⃣ Load Razorpay SDK (once)
      if (!document.getElementById("razorpay-script")) {
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;

        document.body.appendChild(script);

        await new Promise<void>((resolve, reject) => {
          script.onload = () => resolve();
          script.onerror = () =>
            reject(new Error("Razorpay SDK failed to load"));
        });
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK unavailable");
      }

      // 4️⃣ Open Razorpay Checkout
      const rzp = new window.Razorpay({
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Creator OS",
        description: product.name,
        order_id: order.id,

        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/payments/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              window.location.href = "/payment/success";
            } else {
              window.location.href = "/payment/failed";
            }
          } catch (err) {
            console.error("Verification error:", err);
            window.location.href = "/payment/failed";
          }
        },

        modal: {
          ondismiss: () => {
            window.location.href = "/payment/failed";
          },
        },

        prefill: {
          name: "Test User",
          email: "test@example.com",
        },

        theme: {
          color: "#22c55e",
        },
      });

      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto max-w-xl rounded-xl border p-8">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="mt-3 text-muted-foreground">
          {product.description}
        </p>

        <div className="mt-6 text-3xl font-semibold">
          ₹{product.price}
        </div>

        <Button
          onClick={handlePayment}
          disabled={loading}
          className="mt-6 w-full text-lg"
        >
          {loading ? "Processing…" : "Buy Now"}
        </Button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          Secure payment via Razorpay
        </p>
      </div>
    </div>
  );
}
"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    try {
      setLoading(true);

      // 1️⃣ Create subscription
      const res = await fetch("/api/subscription/create", {
        method: "POST",
      });

      const data = await res.json();

      if (!data?.subscription_id) {
        alert("Subscription create failed");
        return;
      }

      // 2️⃣ Load Razorpay script (safe)
      if (!document.getElementById("razorpay-script")) {
        const script = document.createElement("script");
        script.id = "razorpay-script";
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.async = true;
        document.body.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // 3️⃣ Open Razorpay subscription checkout
      const rzp = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        subscription_id: data.subscription_id,
        name: "Creator OS",
        description: "Creator OS Subscription",
        theme: {
          color: "#22c55e",
        },
      });

      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full"
    >
      {loading ? "Processing..." : "Subscribe"}
    </Button>
  );
}
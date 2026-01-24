import Razorpay from "razorpay";
import { validateRazorpayEnv } from "./env";

// Validate environment variables before creating Razorpay instance
const { keyId, keySecret } = validateRazorpayEnv();

export const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

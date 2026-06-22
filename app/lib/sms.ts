const TERMII_API = "https://api.termii.com/api";
const TERMII_KEY = process.env.TERMII_API_KEY;
const TERMII_SENDER = process.env.TERMII_SENDER_ID || "NIDDLE";
const TERMII_CHANNEL = process.env.TERMII_CHANNEL || "dnd";

async function sendSMS(phone: string, message: string): Promise<boolean> {
  if (!TERMII_KEY || !phone) return false;

  try {
    const res = await fetch(`${TERMII_API}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TERMII_KEY,
        to: phone.replace(/[^0-9+]/g, ""),
        from: TERMII_SENDER,
        sms: message,
        type: "plain",
        channel: TERMII_CHANNEL,
      }),
    });
    const data = await res.json();
    return data.status === "success";
  } catch {
    return false;
  }
}

export async function sendOrderConfirmationSMS(phone: string, orderId: string, total: number) {
  const msg = `Hi! Your NIDDLE order #${orderId.slice(0, 8)} has been confirmed. Total: ₦${total.toLocaleString()}. We'll notify you when your rider is assigned.`;
  return sendSMS(phone, msg);
}

export async function sendRiderAssignedSMS(phone: string, riderName: string, orderId: string) {
  const msg = `Great news! ${riderName} has been assigned to your NIDDLE order #${orderId.slice(0, 8)}. Track your delivery in the app.`;
  return sendSMS(phone, msg);
}

export async function sendOrderDeliveredSMS(phone: string, orderId: string) {
  const msg = `Your NIDDLE order #${orderId.slice(0, 8)} has been delivered! Thank you for using NIDDLE. Rate your experience in the app.`;
  return sendSMS(phone, msg);
}

export async function sendRiderPickupSMS(phone: string, storeName: string, orderId: string) {
  const msg = `${storeName} has prepared your order #${orderId.slice(0, 8)}. Your rider is on the way to pick it up!`;
  return sendSMS(phone, msg);
}

export async function sendPasswordResetSMS(phone: string, token: string) {
  const msg = `Your NIDDLE password reset code is: ${token}. Valid for 1 hour. Do not share this code.`;
  return sendSMS(phone, msg);
}

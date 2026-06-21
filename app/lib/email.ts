import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend && process.env.RESEND_API_KEY) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || "NIDDLE <onboarding@resend.dev>";

export async function sendOrderConfirmation(
  to: string,
  customerName: string,
  storeName: string,
  orderId: string,
  total: number,
  estimatedMinutes: number
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmed — ${storeName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5A432C; font-size: 24px;">Order Confirmed! ✅</h1>
          <p style="color: #666; font-size: 14px;">Hi ${customerName},</p>
          <p style="color: #666; font-size: 14px;">Your order from <strong>${storeName}</strong> has been confirmed.</p>
          <div style="background: #faf7f2; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">Order ID</p>
            <p style="color: #5A432C; font-weight: bold; font-size: 14px; margin: 4px 0 12px;">${orderId}</p>
            <p style="color: #999; font-size: 12px; margin: 0;">Total</p>
            <p style="color: #5A432C; font-weight: bold; font-size: 18px; margin: 4px 0 12px;">₦${total.toLocaleString()}</p>
            <p style="color: #999; font-size: 12px; margin: 0;">Estimated Delivery</p>
            <p style="color: #5A432C; font-weight: bold; font-size: 14px; margin: 4px 0;">~${estimatedMinutes} minutes</p>
          </div>
          <p style="color: #666; font-size: 14px;">A rider will be assigned shortly. You'll receive updates as your order progresses.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">NIDDLE — Fast Bicycle Delivery in Lagos</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendRiderAssigned(
  to: string,
  customerName: string,
  riderName: string,
  orderId: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Rider Assigned — Order ${orderId.slice(0, 8)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5A432C; font-size: 24px;">Rider On The Way! 🚴</h1>
          <p style="color: #666; font-size: 14px;">Hi ${customerName},</p>
          <p style="color: #666; font-size: 14px;"><strong>${riderName}</strong> has been assigned to your order and is heading to the store to pick it up.</p>
          <p style="color: #666; font-size: 14px;">Order: <strong>${orderId.slice(0, 8)}</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">NIDDLE — Fast Bicycle Delivery in Lagos</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendOrderDelivered(
  to: string,
  customerName: string,
  storeName: string,
  orderId: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Delivered! 🎉`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5A432C; font-size: 24px;">Order Delivered! 🎉</h1>
          <p style="color: #666; font-size: 14px;">Hi ${customerName},</p>
          <p style="color: #666; font-size: 14px;">Your order from <strong>${storeName}</strong> has been delivered successfully!</p>
          <p style="color: #666; font-size: 14px;">Order: <strong>${orderId.slice(0, 8)}</strong></p>
          <p style="color: #666; font-size: 14px;">We hope you enjoy your items. Don't forget to leave a review!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">NIDDLE — Fast Bicycle Delivery in Lagos</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendNewOrderToStore(
  to: string,
  storeName: string,
  customerName: string,
  orderId: string,
  total: number
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `New Order Received! 📦`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5A432C; font-size: 24px;">New Order! 📦</h1>
          <p style="color: #666; font-size: 14px;">${storeName} has a new order from <strong>${customerName}</strong>.</p>
          <div style="background: #faf7f2; border-radius: 12px; padding: 16px; margin: 16px 0;">
            <p style="color: #999; font-size: 12px; margin: 0;">Order ID</p>
            <p style="color: #5A432C; font-weight: bold; font-size: 14px; margin: 4px 0 12px;">${orderId}</p>
            <p style="color: #999; font-size: 12px; margin: 0;">Total</p>
            <p style="color: #5A432C; font-weight: bold; font-size: 18px; margin: 4px 0;">₦${total.toLocaleString()}</p>
          </div>
          <p style="color: #666; font-size: 14px;">Log in to your dashboard to confirm or manage this order.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">NIDDLE — Store Owner Dashboard</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

export async function sendPasswordReset(
  to: string,
  resetUrl: string
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) return false;
  try {
    await getResend()?.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #5A432C; font-size: 24px;">Password Reset</h1>
          <p style="color: #666; font-size: 14px;">Click the button below to reset your password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; background: #D4A24C; color: white; padding: 12px 24px; border-radius: 12px; text-decoration: none; font-weight: bold; margin: 16px 0;">Reset Password</a>
          <p style="color: #999; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">NIDDLE — Fast Bicycle Delivery in Lagos</p>
        </div>
      `,
    });
    return true;
  } catch {
    return false;
  }
}

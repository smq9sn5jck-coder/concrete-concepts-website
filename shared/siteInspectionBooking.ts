import { SITE_INSPECTION_BOOKING_URL } from "./const";

export function buildSiteInspectionBookingUrl(customerName: string, customerEmail: string): string {
  const url = new URL(SITE_INSPECTION_BOOKING_URL);
  const name = customerName.trim();
  const email = customerEmail.trim();
  if (name) url.searchParams.set("name", name);
  if (email) url.searchParams.set("email", email);
  return url.toString();
}

export function maskAustralianMobile(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 5) return "your mobile";
  return `${digits.slice(0, 2)}•• ••• ${digits.slice(-3)}`;
}

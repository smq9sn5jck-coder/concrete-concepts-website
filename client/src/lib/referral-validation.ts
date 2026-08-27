import { normalizeAustralianPhone } from "./leads";

export type ReferrerType = "private" | "builder" | "trade";

export interface ReferralFormValues {
  referrerType: ReferrerType;
  referrerName: string;
  referrerBusiness: string;
  referrerPhone: string;
  referrerEmail: string;
  customerName: string;
  customerPhone: string;
  suburb: string;
  projectType: string;
  notes: string;
  consentConfirmed: boolean;
  company: string;
}

export type ReferralErrors = Partial<Record<keyof ReferralFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateReferral(values: ReferralFormValues): ReferralErrors {
  const errors: ReferralErrors = {};

  if (!values.referrerName.trim()) {
    errors.referrerName = "Please enter your name.";
  }

  if (!normalizeAustralianPhone(values.referrerPhone)) {
    errors.referrerPhone = "Please enter a valid Australian phone number.";
  }

  if (
    (values.referrerType === "builder" || values.referrerType === "trade") &&
    !values.referrerBusiness.trim()
  ) {
    errors.referrerBusiness = "Please enter your business name.";
  }

  if (
    values.referrerEmail.trim() &&
    !EMAIL_PATTERN.test(values.referrerEmail.trim())
  ) {
    errors.referrerEmail = "Please enter a valid email address.";
  }

  if (!values.customerName.trim()) {
    errors.customerName = "Please enter the customer’s name.";
  }

  if (!normalizeAustralianPhone(values.customerPhone)) {
    errors.customerPhone =
      "Please enter a valid Australian customer phone number.";
  }

  if (!values.suburb.trim()) {
    errors.suburb = "Please enter the project suburb.";
  }

  if (!values.projectType.trim()) {
    errors.projectType = "Please select the project type.";
  }

  if (!values.consentConfirmed) {
    errors.consentConfirmed =
      "Please confirm the customer has agreed to be contacted.";
  }

  return errors;
}

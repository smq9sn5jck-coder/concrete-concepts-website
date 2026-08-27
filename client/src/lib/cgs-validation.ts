import { normalizeAustralianPhone } from "./leads";

export interface CGSFormValues {
  name: string;
  businessName: string;
  email: string;
  phone: string;
  businessType: string;
  website: string;
  growthProblem: string;
  notes: string;
  company: string;
}

export type CGSErrors = Partial<Record<keyof CGSFormValues, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCGSEnquiry(values: CGSFormValues): CGSErrors {
  const errors: CGSErrors = {};

  if (!values.name.trim()) errors.name = "Please enter your name.";
  if (!values.businessName.trim()) {
    errors.businessName = "Please enter your business name.";
  }
  if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }
  if (!normalizeAustralianPhone(values.phone)) {
    errors.phone = "Please enter a valid Australian phone number.";
  }
  if (!values.businessType.trim()) {
    errors.businessType = "Please select your business type.";
  }
  if (!values.growthProblem.trim()) {
    errors.growthProblem = "Please select your main growth problem.";
  }

  return errors;
}

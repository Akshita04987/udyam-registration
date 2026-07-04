/**
 * Validates a single field value against a FormField schema definition.
 * Returns an error string or empty string if valid.
 */
export function validateField(
  fieldId: string,
  value: string | boolean,
  pattern?: string,
  patternMessage?: string,
  required?: boolean,
  requiredMessage?: string
): string {
  if (required) {
    if (typeof value === "boolean") {
      if (!value) return requiredMessage ?? "This field is required";
    } else {
      if (!value || value.trim() === "") return "This field is required";
    }
  }

  if (pattern && typeof value === "string" && value.trim() !== "") {
    const regex = new RegExp(pattern);
    if (!regex.test(value)) return patternMessage ?? "Invalid format";
  }

  return "";
}

/**
 * Validates aadhaar: exactly 12 digits.
 */
export function validateAadhaar(value: string): string {
  return validateField(
    "aadhaarNumber",
    value,
    "^[0-9]{12}$",
    "Aadhaar number must be exactly 12 digits",
    true
  );
}

/**
 * Validates applicant name: letters and spaces only.
 */
export function validateApplicantName(value: string): string {
  return validateField(
    "applicantName",
    value,
    "^[A-Za-z ]+$",
    "Name must contain only letters and spaces",
    true
  );
}

/**
 * Validates OTP: exactly 6 digits.
 */
export function validateOtp(value: string): string {
  return validateField(
    "otp",
    value,
    "^[0-9]{6}$",
    "OTP must be exactly 6 digits",
    true
  );
}

/**
 * Validates PAN: 5 letters + 4 digits + 1 letter (case-insensitive check,
 * value should already be uppercased before calling).
 */
export function validatePan(value: string): string {
  return validateField(
    "panNumber",
    value,
    "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$",
    "PAN must be in format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)",
    true
  );
}

/**
 * Validates PAN holder name (only letters and spaces, conditionally required).
 */
export function validatePanHolderName(
  value: string,
  required: boolean
): string {
  if (required && (!value || value.trim() === "")) {
    return "Name as per PAN is required for this organisation type";
  }
  if (value && value.trim() !== "") {
    return validateField(
      "panHolderName",
      value,
      "^[A-Za-z ]+$",
      "Name must contain only letters and spaces"
    );
  }
  return "";
}

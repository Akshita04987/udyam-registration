/**
 * Shared validation logic — mirrors the frontend schema regexes exactly
 * so server-side validation is consistent with what the user sees.
 */

export const AADHAAR_REGEX = /^[0-9]{12}$/;
export const PAN_REGEX = /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/;
export const NAME_REGEX = /^[A-Za-z ]+$/;

export const VALID_ORG_TYPES = [
  "proprietorship",
  "huf",
  "partnership",
  "cooperative_society",
  "private_ltd",
  "public_ltd",
  "self_help_group",
  "llp",
  "society",
  "trust",
  "others",
] as const;

export type OrgType = (typeof VALID_ORG_TYPES)[number];

export interface SubmitBody {
  aadhaarNumber: string;
  applicantName: string;
  organisationType: string;
  panNumber: string;
  panHolderName?: string;
  dobOrDoi: string;
}

export interface ValidationErrors {
  [field: string]: string;
}

/**
 * Validates the full submission payload.
 * Returns an object of field -> error message.
 * Empty object means valid.
 */
export function validateSubmitBody(body: Partial<SubmitBody>): ValidationErrors {
  const errors: ValidationErrors = {};

  // aadhaarNumber
  if (!body.aadhaarNumber) {
    errors.aadhaarNumber = "Aadhaar number is required";
  } else if (!AADHAAR_REGEX.test(body.aadhaarNumber)) {
    errors.aadhaarNumber = "Aadhaar number must be exactly 12 digits";
  }

  // applicantName
  if (!body.applicantName || body.applicantName.trim() === "") {
    errors.applicantName = "Applicant name is required";
  } else if (!NAME_REGEX.test(body.applicantName)) {
    errors.applicantName = "Applicant name must contain only letters and spaces";
  }

  // organisationType
  if (!body.organisationType) {
    errors.organisationType = "Organisation type is required";
  } else if (!VALID_ORG_TYPES.includes(body.organisationType as OrgType)) {
    errors.organisationType = "Invalid organisation type";
  }

  // panNumber
  if (!body.panNumber) {
    errors.panNumber = "PAN number is required";
  } else if (!PAN_REGEX.test(body.panNumber)) {
    errors.panNumber =
      "PAN must be in format: 5 letters, 4 digits, 1 letter (e.g. ABCDE1234F)";
  }

  // panHolderName — required when org type is NOT proprietorship
  const needsPanHolder =
    body.organisationType && body.organisationType !== "proprietorship";
  if (needsPanHolder) {
    if (!body.panHolderName || body.panHolderName.trim() === "") {
      errors.panHolderName =
        "Name as per PAN is required for this organisation type";
    } else if (!NAME_REGEX.test(body.panHolderName)) {
      errors.panHolderName = "PAN holder name must contain only letters and spaces";
    }
  }

  // dobOrDoi
  if (!body.dobOrDoi) {
    errors.dobOrDoi = "Date of birth / date of incorporation is required";
  } else {
    const date = new Date(body.dobOrDoi);
    if (isNaN(date.getTime())) {
      errors.dobOrDoi = "Invalid date format";
    } else if (date > new Date()) {
      errors.dobOrDoi = "Date cannot be in the future";
    }
  }

  return errors;
}

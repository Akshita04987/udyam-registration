// Types derived from udyamFormSchema.json

export interface SelectOption {
  value: string;
  label: string;
}

export interface ShowWhenCondition {
  field: string;
  notEquals?: string;
  equals?: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "text" | "checkbox" | "select" | "date" | "button";
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  inputMode?: "numeric" | "text" | "email" | "tel";
  helpText?: string;
  options?: SelectOption[];
  autoUppercase?: boolean;
  conditional?: boolean;
  showAfter?: string;
  showWhen?: ShowWhenCondition;
  dependsOn?: string[];
  variant?: "primary" | "secondary";
  requiredMessage?: string;
  maxDate?: string;
}

export interface FormStep {
  step: number;
  title: string;
  description: string;
  fields: FormField[];
}

export interface UdyamFormSchema {
  steps: FormStep[];
}

// Step 1 form values
export interface Step1Values {
  aadhaarNumber: string;
  applicantName: string;
  consent: boolean;
  otp: string;
}

// Step 2 form values
export interface Step2Values {
  organisationType: string;
  panNumber: string;
  panHolderName: string;
  dobOrDoi: string;
}

export interface SubmitPayload extends Step1Values, Step2Values {}

export interface SubmitResponse {
  referenceNumber: string;
  message?: string;
}

"use client";

import { useStep1Form } from "@/hooks/useStep1Form";
import schemaRaw from "@/schema/udyamFormSchema.json";
import { UdyamFormSchema, FormField } from "@/types/form";

const schema = schemaRaw as UdyamFormSchema;
const step1Fields = schema.steps[0].fields;

interface Step1FormProps {
  onNext: (values: {
    aadhaarNumber: string;
    applicantName: string;
    consent: boolean;
    otp: string;
  }) => void;
}

function renderLabel(field: FormField) {
  return (
    <label htmlFor={field.id} className="field-label">
      {field.label}
      {field.required && field.type !== "checkbox" && (
        <span className="required-star" aria-hidden="true">
          {" "}*
        </span>
      )}
    </label>
  );
}

export default function Step1Form({ onNext }: Step1FormProps) {
  const {
    values,
    errors,
    otpRequested,
    otpLoading,
    resendTimer,
    otpButtonEnabled,
    handleChange,
    requestOtp,
    resendOtp,
    submit,
  } = useStep1Form();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (submit()) {
      onNext({
        aadhaarNumber: values.aadhaarNumber,
        applicantName: values.applicantName,
        consent: values.consent,
        otp: values.otp,
      });
    }
  };

  // Render individual fields from schema
  const renderField = (field: FormField) => {
    // The OTP field only shows after OTP is requested
    if (field.conditional && field.showAfter === "otpRequested" && !otpRequested) {
      return null;
    }
    // The OTP trigger button
    if (field.type === "button") {
      return (
        <div key={field.id} className="field-group">
          <button
            id={field.id}
            type="button"
            className={`btn btn-primary otp-btn ${
              !otpButtonEnabled || otpLoading ? "btn-disabled" : ""
            }`}
            disabled={!otpButtonEnabled || otpLoading}
            onClick={requestOtp}
            aria-busy={otpLoading}
          >
            {otpLoading ? (
              <span className="btn-loading">
                <span className="spinner" aria-hidden="true" />
                Sending OTP…
              </span>
            ) : otpRequested ? (
              "Resend OTP"
            ) : (
              field.label
            )}
          </button>
          {field.helpText && (
            <p className="field-hint">{field.helpText}</p>
          )}
        </div>
      );
    }

    if (field.type === "checkbox") {
      return (
        <div key={field.id} className="field-group checkbox-group">
          <div className="checkbox-row">
            <input
              id={field.id}
              type="checkbox"
              className="checkbox-input"
              checked={values.consent}
              onChange={(e) => handleChange("consent", e.target.checked)}
              aria-describedby={errors.consent ? `${field.id}-error` : undefined}
              aria-invalid={!!errors.consent}
            />
            <label htmlFor={field.id} className="checkbox-label">
              {field.label}
            </label>
          </div>
          {errors.consent && (
            <p id={`${field.id}-error`} className="field-error" role="alert">
              {errors.consent}
            </p>
          )}
        </div>
      );
    }

    // Text inputs (aadhaar, name, otp)
    const fieldKey = field.id as keyof typeof values;
    const errorMsg = errors[fieldKey as keyof typeof errors];

    return (
      <div key={field.id} className="field-group">
        {renderLabel(field)}
        <input
          id={field.id}
          type={field.type}
          inputMode={field.inputMode}
          className={`field-input ${errorMsg ? "field-input-error" : ""}`}
          placeholder={field.placeholder}
          value={String(values[fieldKey] ?? "")}
          maxLength={field.maxLength}
          onChange={(e) =>
            handleChange(field.id as keyof typeof values, e.target.value)
          }
          aria-describedby={
            errorMsg
              ? `${field.id}-error`
              : field.helpText
              ? `${field.id}-hint`
              : undefined
          }
          aria-invalid={!!errorMsg}
          autoComplete="off"
        />
        {errorMsg && (
          <p id={`${field.id}-error`} className="field-error" role="alert">
            {errorMsg}
          </p>
        )}
        {field.helpText && !errorMsg && (
          <p id={`${field.id}-hint`} className="field-hint">
            {field.helpText}
          </p>
        )}
        {/* Resend timer shown below OTP field */}
        {field.id === "otp" && otpRequested && (
          <div className="resend-row">
            {resendTimer > 0 ? (
              <span className="resend-timer">
                Resend OTP in{" "}
                <strong>{resendTimer}s</strong>
              </span>
            ) : (
              <button
                type="button"
                className="resend-btn"
                onClick={resendOtp}
              >
                Resend OTP
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <form
      id="step1-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Step 1: Aadhaar Verification"
    >
      <div className="step-description">
        <p>{schema.steps[0].description}</p>
      </div>

      {step1Fields.map(renderField)}

      {/* Next button — only shown once OTP has been requested */}
      {otpRequested && (
        <div className="form-actions">
          <button
            id="step1-next-btn"
            type="submit"
            className="btn btn-primary btn-full"
          >
            Next: PAN Verification →
          </button>
        </div>
      )}
    </form>
  );
}

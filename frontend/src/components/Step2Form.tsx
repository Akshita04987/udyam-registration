"use client";

import { useStep2Form } from "@/hooks/useStep2Form";
import schemaRaw from "@/schema/udyamFormSchema.json";
import { UdyamFormSchema, FormField, Step2Values } from "@/types/form";

const schema = schemaRaw as UdyamFormSchema;
const step2Schema = schema.steps[1];
const step2Fields = step2Schema.fields;

interface Step2FormProps {
  step1Data: {
    aadhaarNumber: string;
    applicantName: string;
    consent: boolean;
    otp: string;
  };
  onSuccess: (referenceNumber: string) => void;
}

function renderLabel(field: FormField, required: boolean) {
  return (
    <label htmlFor={field.id} className="field-label">
      {field.label}
      {required && (
        <span className="required-star" aria-hidden="true">
          {" "}*
        </span>
      )}
    </label>
  );
}

export default function Step2Form({ step1Data, onSuccess }: Step2FormProps) {
  const {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    panHolderNameRequired,
    handleChange,
    validateAll,
  } = useStep2Form();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        aadhaarNumber: step1Data.aadhaarNumber,
        applicantName: step1Data.applicantName,
        organisationType: values.organisationType,
        panNumber: values.panNumber,
        panHolderName: values.panHolderName,
        dobOrDoi: values.dobOrDoi,
      };

      const res = await fetch("http://localhost:4000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data?.message ?? "Submission failed. Please try again.");
        return;
      }

      onSuccess(data.referenceNumber);
    } catch {
      alert(
        "Could not connect to the server. Please ensure the backend is running."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  const renderField = (field: FormField) => {
    // Conditionally hide pan holder name for proprietorship
    if (
      field.id === "panHolderName" &&
      field.conditional &&
      !panHolderNameRequired
    ) {
      return null;
    }

    const fieldKey = field.id as keyof Step2Values;
    const errorMsg = errors[fieldKey as keyof typeof errors];
    const isRequired =
      field.id === "panHolderName" ? panHolderNameRequired : !!field.required;

    if (field.type === "select" && field.options) {
      return (
        <div key={field.id} className="field-group">
          {renderLabel(field, isRequired)}
          <select
            id={field.id}
            className={`field-input field-select ${errorMsg ? "field-input-error" : ""
              }`}
            value={values[fieldKey]}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            aria-describedby={
              errorMsg
                ? `${field.id}-error`
                : field.helpText
                  ? `${field.id}-hint`
                  : undefined
            }
            aria-invalid={!!errorMsg}
          >
            <option value="">{field.placeholder}</option>
            {field.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
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
        </div>
      );
    }

    if (field.type === "date") {
      return (
        <div key={field.id} className="field-group">
          {renderLabel(field, isRequired)}
          <input
            id={field.id}
            type="date"
            className={`field-input ${errorMsg ? "field-input-error" : ""}`}
            value={values[fieldKey]}
            max={today}
            onChange={(e) => handleChange(fieldKey, e.target.value)}
            aria-describedby={
              errorMsg
                ? `${field.id}-error`
                : field.helpText
                  ? `${field.id}-hint`
                  : undefined
            }
            aria-invalid={!!errorMsg}
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
        </div>
      );
    }

    // Text inputs
    return (
      <div key={field.id} className="field-group">
        {renderLabel(field, isRequired)}
        <input
          id={field.id}
          type="text"
          className={`field-input ${errorMsg ? "field-input-error" : ""}`}
          placeholder={field.placeholder}
          value={values[fieldKey]}
          maxLength={field.maxLength}
          onChange={(e) => handleChange(fieldKey, e.target.value)}
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
      </div>
    );
  };

  return (
    <form
      id="step2-form"
      onSubmit={handleSubmit}
      noValidate
      aria-label="Step 2: PAN Verification"
    >
      <div className="step-description">
        <p>{step2Schema.description}</p>
      </div>

      {step2Fields.map(renderField)}

      <div className="form-actions">
        <button
          id="step2-submit-btn"
          type="submit"
          className={`btn btn-primary btn-full ${isSubmitting ? "btn-disabled" : ""
            }`}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? (
            <span className="btn-loading">
              <span className="spinner" aria-hidden="true" />
              Submitting…
            </span>
          ) : (
            "Submit Registration"
          )}
        </button>
      </div>
    </form>
  );
}

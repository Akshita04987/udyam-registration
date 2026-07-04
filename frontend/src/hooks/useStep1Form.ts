"use client";

import { useState, useCallback, useRef } from "react";
import {
  validateAadhaar,
  validateApplicantName,
  validateOtp,
} from "@/lib/validators";
import { Step1Values } from "@/types/form";

interface Step1Errors {
  aadhaarNumber: string;
  applicantName: string;
  consent: string;
  otp: string;
}

const RESEND_COOLDOWN = 30; // seconds

export function useStep1Form() {
  const [values, setValues] = useState<Step1Values>({
    aadhaarNumber: "",
    applicantName: "",
    consent: false,
    otp: "",
  });

  const [errors, setErrors] = useState<Step1Errors>({
    aadhaarNumber: "",
    applicantName: "",
    consent: "",
    otp: "",
  });

  const [otpRequested, setOtpRequested] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Field-level change handlers
  const handleChange = useCallback(
    (field: keyof Step1Values, value: string | boolean) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      // Clear error on change
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
  );

  // Validate all step-1 fields, return true if valid
  const validateAll = useCallback((): boolean => {
    const errs: Step1Errors = {
      aadhaarNumber: validateAadhaar(values.aadhaarNumber),
      applicantName: validateApplicantName(values.applicantName),
      consent: values.consent ? "" : "You must provide consent to proceed",
      otp: otpRequested ? validateOtp(values.otp) : "",
    };
    setErrors(errs);
    return Object.values(errs).every((e) => e === "");
  }, [values, otpRequested]);

  // Whether the "Validate & Generate OTP" button should be enabled
  const otpButtonEnabled =
    /^[0-9]{12}$/.test(values.aadhaarNumber) &&
    /^[A-Za-z ]+$/.test(values.applicantName) &&
    values.applicantName.trim().length > 0 &&
    values.consent;

  // Start the 30-second resend countdown
  const startResendTimer = useCallback(() => {
    setResendTimer(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Mock OTP send — 800ms fake delay
  const requestOtp = useCallback(async () => {
    // Validate aadhaar + name + consent first
    const errs: Step1Errors = {
      aadhaarNumber: validateAadhaar(values.aadhaarNumber),
      applicantName: validateApplicantName(values.applicantName),
      consent: values.consent ? "" : "You must provide consent to proceed",
      otp: "",
    };
    setErrors(errs);
    const hasErrors = Object.values(errs).some((e) => e !== "");
    if (hasErrors) return;

    setOtpLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOtpLoading(false);
    setOtpRequested(true);
    startResendTimer();
  }, [values, startResendTimer]);

  // Resend OTP (same mock delay, reset timer)
  const resendOtp = useCallback(async () => {
    if (resendTimer > 0) return;
    setOtpLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setOtpLoading(false);
    setValues((prev) => ({ ...prev, otp: "" }));
    setErrors((prev) => ({ ...prev, otp: "" }));
    startResendTimer();
  }, [resendTimer, startResendTimer]);

  // Called when user clicks "Next" on step 1
  const submit = useCallback((): boolean => {
    return validateAll();
  }, [validateAll]);

  return {
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
  };
}

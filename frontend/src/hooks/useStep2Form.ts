"use client";

import { useState, useCallback } from "react";
import {
  validatePan,
  validatePanHolderName,
  validateField,
} from "@/lib/validators";
import { Step2Values } from "@/types/form";

interface Step2Errors {
  organisationType: string;
  panNumber: string;
  panHolderName: string;
  dobOrDoi: string;
}

export function useStep2Form() {
  const [values, setValues] = useState<Step2Values>({
    organisationType: "",
    panNumber: "",
    panHolderName: "",
    dobOrDoi: "",
  });

  const [errors, setErrors] = useState<Step2Errors>({
    organisationType: "",
    panNumber: "",
    panHolderName: "",
    dobOrDoi: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // PAN holder name is required unless org type is proprietorship
  const panHolderNameRequired =
    values.organisationType !== "" &&
    values.organisationType !== "proprietorship";

  const handleChange = useCallback(
    (field: keyof Step2Values, value: string) => {
      let finalValue = value;
      // Auto-uppercase PAN as user types
      if (field === "panNumber") {
        finalValue = value.toUpperCase();
      }
      setValues((prev) => ({ ...prev, [field]: finalValue }));
      setErrors((prev) => ({ ...prev, [field]: "" }));
    },
    []
  );

  const validateAll = useCallback((): boolean => {
    const errs: Step2Errors = {
      organisationType: validateField(
        "organisationType",
        values.organisationType,
        undefined,
        undefined,
        true
      ),
      panNumber: validatePan(values.panNumber),
      panHolderName: validatePanHolderName(
        values.panHolderName,
        panHolderNameRequired
      ),
      dobOrDoi: validateField(
        "dobOrDoi",
        values.dobOrDoi,
        undefined,
        undefined,
        true
      ),
    };
    setErrors(errs);
    return Object.values(errs).every((e) => e === "");
  }, [values, panHolderNameRequired]);

  return {
    values,
    errors,
    isSubmitting,
    setIsSubmitting,
    panHolderNameRequired,
    handleChange,
    validateAll,
  };
}

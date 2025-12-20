"use client";

import { useState } from "react";
import { AxiosError } from "axios";
import { useRequestPasswordReset } from "@/hooks/useAuth";

export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const forgotPasswordMutation = useRequestPasswordReset();

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { email?: string } = {};
    setGeneralError("");

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (value: string) => {
    setEmail(value);
    if (errors.email) {
      setErrors({});
    }
    if (generalError) {
      setGeneralError("");
    }
    if (successMessage) {
      setSuccessMessage("");
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    forgotPasswordMutation.mutate(email, {
      onSuccess: () => {
        setSuccessMessage(
          "Password reset link has been sent to your email. Please check your inbox."
        );
        setEmail("");
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError?.response?.data?.message ||
          "Failed to send reset email. Please try again.";
        setGeneralError(errorMessage);
      },
    });
  };

  return {
    email,
    errors,
    generalError,
    successMessage,
    handleChange,
    handleSubmit,
    clearGeneralError: () => setGeneralError(""),
    clearSuccessMessage: () => setSuccessMessage(""),
    isLoading: forgotPasswordMutation.isPending,
  };
};

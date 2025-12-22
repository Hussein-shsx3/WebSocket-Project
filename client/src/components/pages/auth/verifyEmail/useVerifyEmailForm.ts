"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { useVerifyEmail, useResendVerification } from "@/hooks/useAuth";

export const useVerifyEmailForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  // Pre-fill with token if available, otherwise empty string
  const [verificationCode, setVerificationCode] = useState(token);
  const [errors, setErrors] = useState<{ code?: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationMutation = useResendVerification();

  const validateForm = (): boolean => {
    const newErrors: { code?: string } = {};
    setGeneralError("");

    if (!verificationCode) {
      newErrors.code = "Verification code is required";
    } else if (verificationCode.length < 6) {
      newErrors.code = "Verification code must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (value: string) => {
    setVerificationCode(value);
    if (errors.code) setErrors({});
    if (generalError) setGeneralError("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) return;

    verifyEmailMutation.mutate(verificationCode, {
      onSuccess: () => {
        setSuccessMessage("Email verified successfully! Redirecting to login...");
        setTimeout(() => router.push("/signIn"), 2000);
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError?.response?.data?.message ||
          "Email verification failed. Please try again.";
        setGeneralError(errorMessage);
      },
    });
  };

  const handleResendVerification = () => {
    if (!email) {
      setGeneralError("Email is required to resend verification code.");
      return;
    }

    resendVerificationMutation.mutate(email, {
      onSuccess: () => {
        setSuccessMessage("Verification code sent to your email!");
        setResendCooldown(60);
        setVerificationCode(""); // Clear input after resend
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError?.response?.data?.message ||
          "Failed to resend verification code. Please try again.";
        setGeneralError(errorMessage);
      },
    });
  };

  return {
    email,
    verificationCode,
    errors,
    generalError,
    successMessage,
    resendCooldown,
    handleChange,
    handleSubmit,
    handleResendVerification,
    clearGeneralError: () => setGeneralError(""),
    clearSuccessMessage: () => setSuccessMessage(""),
    isLoading: verifyEmailMutation.isPending,
    isResending: resendVerificationMutation.isPending,
  };
};

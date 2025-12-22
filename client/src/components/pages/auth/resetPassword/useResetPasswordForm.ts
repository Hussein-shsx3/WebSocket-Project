"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AxiosError } from "axios";
import { useResetPassword } from "@/hooks/useAuth";

export const useResetPasswordForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string }>({});
  const [generalError, setGeneralError] = useState<string>("");
  const resetPasswordMutation = useResetPassword();

  // Validation
  const validateForm = (): boolean => {
    const newErrors: { password?: string; confirmPassword?: string } = {};
    setGeneralError("");

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!token) {
      setGeneralError("Invalid reset token. Please request a new password reset.");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !!token;
  };

  // Handle input change
  const handleChange = (field: "password" | "confirmPassword", value: string) => {
    if (field === "password") {
      setPassword(value);
    } else {
      setConfirmPassword(value);
    }
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    if (generalError) {
      setGeneralError("");
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    resetPasswordMutation.mutate(
      { token, newPassword: password },
      {
        onSuccess: () => {
          router.push("/signIn?message=Password reset successfully. Please sign in.");
        },
        onError: (error: Error) => {
          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError?.response?.data?.message ||
            "Failed to reset password. Please try again.";
          setGeneralError(errorMessage);
        },
      }
    );
  };

  return {
    token,
    password,
    confirmPassword,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    clearGeneralError: () => setGeneralError(""),
    isLoading: resetPasswordMutation.isPending,
  };
};

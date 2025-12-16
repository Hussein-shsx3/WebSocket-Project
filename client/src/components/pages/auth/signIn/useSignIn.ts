"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useLogin } from "@/hooks/useAuth";
import { LoginRequest } from "@/services/auth.service";

export const useSignIn = () => {
  const router = useRouter();
  const loginMutation = useLogin();

  // Form state
  const [formData, setFormData] = useState<LoginRequest>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<LoginRequest>>({});
  const [generalError, setGeneralError] = useState<string>("");

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<LoginRequest> = {};
    setGeneralError(""); // Clear previous errors

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (field: keyof LoginRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
    }
    // Clear general error when user starts typing
    if (generalError) {
      setGeneralError("");
    }
  };

  // Handle form submit
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Call login API
    loginMutation.mutate(formData, {
      onSuccess: () => {
        // Redirect to chats on success
        router.push("/chats");
      },
      onError: (error: Error) => {
        // Handle API error
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError?.response?.data?.message || "Login failed. Please try again.";
        setGeneralError(errorMessage);
      },
    });
  };

  return {
    // Form data
    formData,
    errors,
    generalError,

    // Handlers
    handleChange,
    handleSubmit,
    clearGeneralError: () => setGeneralError(""),

    // State
    isLoading: loginMutation.isPending,
    isError: loginMutation.isError,
  };
};


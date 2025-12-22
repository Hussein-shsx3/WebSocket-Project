"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { useRegister } from "@/hooks/useAuth";
import { RegisterRequest, RegisterResponse } from "@/services/auth.service";

export const useSignUp = () => {
  const router = useRouter();
  const registerMutation = useRegister();

  // Form state
  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<Partial<RegisterRequest>>({});
  const [generalError, setGeneralError] = useState<string>("");

  // Validation
  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterRequest> = {};
    setGeneralError("");

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

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
  const handleChange = (field: keyof RegisterRequest, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
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

    registerMutation.mutate(formData, {
      onSuccess: (data: RegisterResponse) => {
        router.push(
          `/verifyEmail?email=${encodeURIComponent(formData.email)}&token=${encodeURIComponent(data.verificationToken)}`
        );
      },
      onError: (error: Error) => {
        const axiosError = error as AxiosError<{ message: string }>;
        const errorMessage =
          axiosError?.response?.data?.message ||
          "Registration failed. Please try again.";
        setGeneralError(errorMessage);
      },
    });
  };

  return {
    formData,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    clearGeneralError: () => setGeneralError(""),
    isLoading: registerMutation.isPending,
  };
};

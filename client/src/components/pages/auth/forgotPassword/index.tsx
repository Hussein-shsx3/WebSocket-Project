"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import {
  Button,
  FormHeader,
  Input,
  AuthSwitchLink,
} from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useForgotPassword } from "./useForgotPassword";

const ForgotPassword = () => {
  const {
    email,
    errors,
    generalError,
    successMessage,
    handleChange,
    handleSubmit,
    isLoading,
    clearGeneralError,
    clearSuccessMessage,
  } = useForgotPassword();

  return (
    <AuthContainer>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20"
      >
        <FormHeader
          title="Reset Password"
          subtitle="Enter your email to receive a password reset link."
        />

        {generalError && (
          <ErrorAlert message={generalError} onDismiss={clearGeneralError} />
        )}

        {successMessage && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 flex justify-between items-center">
            <span>{successMessage}</span>
            <button
              type="button"
              onClick={clearSuccessMessage}
              className="text-green-700 hover:text-green-900 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => handleChange(e.target.value)}
          error={errors.email}
        />

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </Button>

        <AuthSwitchLink mode="signin" />
      </form>
    </AuthContainer>
  );
};

export default ForgotPassword;

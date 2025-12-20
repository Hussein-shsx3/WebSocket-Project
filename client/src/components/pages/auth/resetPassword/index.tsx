"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import {
  Button,
  FormHeader,
  Input,
} from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useResetPasswordForm } from "./useResetPasswordForm";

const ResetPassword = () => {
  const {
    token,
    password,
    confirmPassword,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    isLoading,
    clearGeneralError,
  } = useResetPasswordForm();

  if (!token) {
    return (
      <AuthContainer>
        <div className="w-full md:w-1/2 lg:w-1/3 flex flex-col gap-4 z-20">
          <ErrorAlert 
            message="Invalid or missing reset token. Please request a new password reset link."
            onDismiss={() => {}}
          />
        </div>
      </AuthContainer>
    );
  }

  return (
    <AuthContainer>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20"
      >
        <FormHeader
          title="Create New Password"
          subtitle="Enter your new password below."
        />

        {generalError && (
          <ErrorAlert message={generalError} onDismiss={clearGeneralError} />
        )}

        <Input
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        <Input
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => handleChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
    </AuthContainer>
  );
};

export default ResetPassword;

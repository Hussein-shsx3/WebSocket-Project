"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import {
  Button,
  FormHeader,
  Input,
} from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useVerifyEmailForm } from "./useVerifyEmailForm";

const VerifyEmail = () => {
  const {
    email,
    verificationCode,
    errors,
    generalError,
    successMessage,
    resendCooldown,
    handleChange,
    handleSubmit,
    handleResendVerification,
    isLoading,
    isResending,
    clearGeneralError,
    clearSuccessMessage,
  } = useVerifyEmailForm();

  return (
    <AuthContainer>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20"
      >
        <FormHeader
          title="Verify Email"
          subtitle="Enter the verification code sent to your email."
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

        {email && (
          <div className="text-sm text-gray-600">
            Verification code sent to: <span className="font-semibold">{email}</span>
          </div>
        )}

        <Input
          label="Verification Code"
          type="text"
          value={verificationCode}
          onChange={(e) => handleChange(e.target.value)}
          error={errors.code}
        />

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            Didn&apos;t receive the code?
          </p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || isResending}
            className={`text-sm font-semibold transition-colors ${
              resendCooldown > 0 || isResending
                ? "text-gray-400 cursor-not-allowed"
                : "text-blue-600 hover:text-blue-800"
            }`}
          >
            {isResending
              ? "Sending..."
              : resendCooldown > 0
              ? `Resend in ${resendCooldown}s`
              : "Resend Code"}
          </button>
        </div>
      </form>
    </AuthContainer>
  );
};

export default VerifyEmail;

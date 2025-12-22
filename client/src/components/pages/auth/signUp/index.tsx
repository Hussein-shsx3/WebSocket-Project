"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import {
  Button,
  GoogleButton,
  FormHeader,
  Input,
  AuthSwitchLink,
} from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useSignUp } from "./useSignUp";

const SignUp = () => {
  const {
    formData,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    isLoading,
    clearGeneralError,
  } = useSignUp();

  return (
    <AuthContainer>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20"
      >
        <FormHeader
          title="Create Account"
          subtitle="Join Doot and start chatting."
        />

        {generalError && (
          <ErrorAlert message={generalError} onDismiss={clearGeneralError} />
        )}

        <Input
          label="Full Name"
          type="text"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          error={errors.password}
        />

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? "Creating Account..." : "Sign Up"}
        </Button>

        <GoogleButton text="Sign Up with Google" />

        <AuthSwitchLink mode="signUp" />
      </form>
    </AuthContainer>
  );
};

export default SignUp;

"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import {
  Button,
  GoogleButton,
  FormHeader,
  Milestone,
  Input,
  ForgetPassword,
  AuthSwitchLink,
} from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useSignIn } from "./useSignIn";

const SignIn = () => {
  const {
    formData,
    errors,
    generalError,
    handleChange,
    handleSubmit,
    isLoading,
    clearGeneralError,
  } = useSignIn();

  return (
    <AuthContainer>
      <form
        onSubmit={handleSubmit}
        className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20"
      >
        <FormHeader
          title="Welcome Back !"
          subtitle="Sign in to continue to Doot."
        />

        {generalError && (
          <ErrorAlert message={generalError} onDismiss={clearGeneralError} />
        )}

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

        <ForgetPassword />

        <Button type="submit" isLoading={isLoading}>
          {isLoading ? "Signing In..." : "Sign In"}
        </Button>

        <Milestone title="Sign in with" />

        <GoogleButton />

        <AuthSwitchLink mode="signIn" />
      </form>
    </AuthContainer>
  );
};

export default SignIn;

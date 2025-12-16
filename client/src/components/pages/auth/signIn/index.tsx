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

const SignIn = () => {
  return (
    <AuthContainer>
      <form className="w-full md:w-1/3 flex flex-col gap-4 z-20">
        <FormHeader />
        <Input label="Email" type="email" />
        <Input label="Password" type="password" />
        <ForgetPassword />
        <Button type="submit">Sign In</Button>
        <Milestone />
        <GoogleButton />
        <AuthSwitchLink mode="signin" />
      </form>
    </AuthContainer>
  );
};

export default SignIn;

"use client";

import Link from "next/link";

interface AuthSwitchLinkProps {
  mode: "signin" | "signup";
}

const AuthSwitchLink = ({ mode }: AuthSwitchLinkProps) => {
  return mode === "signin" ? (
    <div className="text-center text-gray-600 mt-5">
      Don&apos;t have an account?{" "}
      <Link
        href="/register"
        className="text-primaryColor hover:underline font-medium"
      >
        Register
      </Link>
    </div>
  ) : (
    <div className="text-center text-sm text-gray-600 mt-2">
      Already have an account?{" "}
      <Link
        href="/signIn"
        className="text-primaryColor hover:underline font-medium"
      >
        Sign In
      </Link>
    </div>
  );
};

export default AuthSwitchLink;

"use client";
import Link from "next/link";

const ForgetPassword = () => {
  return (
    <Link
      className="text-right text-[15px] text-gray-500 hover:text-primaryColor"
      href="/forgot-password"
    >
      Forgot Password?
    </Link>
  );
};

export default ForgetPassword;

"use client";

import AuthContainer from "@/components/ui/display/AuthContainer";
import { FormHeader } from "@/components/ui/form";
import ErrorAlert from "@/components/ui/feedback/ErrorAlert";
import { useGoogleCallback } from "./useGoogleCallback";

const GoogleCallback = () => {
  const { errorMessage } = useGoogleCallback();

  return (
    <AuthContainer>
      <div className="w-full md:w-1/2 xl:w-1/3 flex flex-col gap-4 z-20">
        {errorMessage ? (
          <>
            <FormHeader
              title="Authentication Failed"
              subtitle="Redirecting you back to sign in..."
            />
            <ErrorAlert message={errorMessage} onDismiss={() => {}} />
          </>
        ) : (
          <>
            <FormHeader
              title="Sign In Successful"
              subtitle="Welcome! Redirecting you to your dashboard..."
            />
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primaryColor"></div>
            </div>
            <p className="text-center text-gray-600 text-sm">
              Authentication completed successfully. Taking you to your chats...
            </p>
          </>
        )}
      </div>
    </AuthContainer>
  );
};

export default GoogleCallback;

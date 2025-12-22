import React from "react";
import { MessageSquareText } from "lucide-react";
import Image from "next/image";

interface ContainerProps {
  children: React.ReactNode;
}
const AuthContainer = ({ children }: ContainerProps) => {
  return (
    <section className="h-[100dvh] w-[100vw] flex flex-col lg:flex-row items-start justify-start lg:justify-between bg-primaryColor p-4 md:p-7">
      <div className="w-full lg:w-[20%] p-8">
        <div className="flex flex-col justify-center items-center lg:items-start lg:justify-start">
          <h2 className="text-white font-medium flex flex-row items-center gap-4">
            <MessageSquareText size={25} />
            <p>Doot</p>
          </h2>
          <p className="text-gray-300 font-medium">
            Responsive Bootstrap 5 Chat App
          </p>
        </div>
      </div>
      <div className="w-full lg:w-[74%] md:h-full bg-white rounded-2xl flex justify-center items-center py-10 md:py-5 px-5 mt-10 md:mt-0">
        {children}
      </div>
      <Image
        className="absolute hidden lg:block bottom-2 left-2 md:bottom-5 md:left-8 xl:left-16 w-40 h-auto md:w-56 lg:w-[500px] xl:w-[600px]"
        src="/images/auth-img.png"
        alt="Authentication Image"
        width={830}
        height={830}
      />
    </section>
  );
};

export default AuthContainer;

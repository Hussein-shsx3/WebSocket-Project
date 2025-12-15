import React from "react";
import { MessageSquareText } from "lucide-react";
import Image from "next/image";

interface ContainerProps {
  children: React.ReactNode;
}
const AuthContainer = ({ children }: ContainerProps) => {
  return (
    <section className="h-[100dvh] w-[100vw] flex flex-col xl:flex-row items-start justify-center xl:justify-between bg-primaryBg p-7">
      <div className="w-full xl:w-[20%] p-8">
        <div className="flex flex-col justify-center items-center xl:items-start xl:justify-start">
          <h2 className="text-white font-medium flex flex-row items-center gap-4">
            <MessageSquareText size={25} />
            <p>Doot</p>
          </h2>
          <p className="text-gray-300 font-medium">
            Responsive Bootstrap 5 Chat App
          </p>
        </div>
      </div>
      <div className="w-full xl:w-[74%] h-full bg-white rounded-2xl flex justify-center items-center">
        {children}
      </div>
      <Image
        className="absolute hidden lg:block bottom-2 left-2 md:bottom-5 md:left-8 xl:left-16 w-40 h-auto md:w-96 lg:w-[730px] xl:w-[800px]"
        src="/images/auth-img.png"
        alt="Authentication Image"
        width={830}
        height={830}
        sizes="(max-width: 640px) 10vw, (max-width: 1024px) 30vw, 830px"
      />
    </section>
  );
};

export default AuthContainer;

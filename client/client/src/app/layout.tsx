import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

// Poppins for headings and display text
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#37475a",
};

export const metadata: Metadata = {
  title: "Chat App",
  description:
    "Modern real-time chat application with video calls, file sharing, and more",
  keywords: ["chat", "messaging", "video call", "real-time", "communication"],
  authors: [{ name: "Chat App Team" }],
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Chat App",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <body
        className={`${inter.className} antialiased bg-[#37475a] text-white overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/context/AuthProvider";
import { Toaster } from "@/components/ui/sonner"
// import Navbar from "@/components/Navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Truly Feedback",
  description: "Send and receive anonymous messages with ease and privacy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>

      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <Navbar /> */}
        {children}
        <Toaster />
      </body>
      </AuthProvider>
    </html>
  );
}

import type { Metadata } from "next";
import { Jua, Nanum_Pen_Script } from "next/font/google";
import "./globals.css";
import Navigation from "./components/Navigation";
import Providers from "./components/Providers";

const jua = Jua({ 
  subsets: ["latin"],
  weight: ['400'],
  display: 'swap',
  variable: '--font-jua',
});

const nanumPenScript = Nanum_Pen_Script({ 
  subsets: ["latin"],
  weight: ['400'],
  display: 'swap',
  variable: '--font-nanum-pen',
});

export const metadata: Metadata = {
  title: "azuki's page",
  description: "Manage your pets with ease",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jua.variable} ${nanumPenScript.variable}`}>
        <Providers>
          <div className="min-h-screen bg-[#454f61]">
            <Navigation />
            <main>{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

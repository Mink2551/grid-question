import type { Metadata } from "next";
import { Mali } from "next/font/google";
import "./globals.css";

const mali = Mali({
  variable: "--font-mali",
  subsets: ["latin", "thai"],
  weight: ["300", "500", "700"],
});

export const metadata: Metadata = {
  title: "Grid Questions",
  description: "Grid",
  icons: {
    icon: "-",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${mali.variable} antialiased bg-SC_White`}>
          {children}
      </body>
    </html>
  );
}

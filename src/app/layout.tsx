import type { Metadata } from "next";
import type { ReactNode } from "react";
import { StudioHeader } from "@/components/StudioHeader";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HL Fitness Studio",
  description: "Class schedules and studio inventory.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a
          className="absolute -top-[70px] left-4 z-30 rounded-md bg-studio px-[18px] py-3 text-white focus:top-3"
          href="#main-content"
        >
          Skip to main content
        </a>
        <StudioHeader />
        {children}
      </body>
    </html>
  );
}

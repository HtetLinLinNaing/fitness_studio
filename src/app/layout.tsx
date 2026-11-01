import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "HL Fitness Studio | Class timetable",
  description: "Explore the HL Fitness Studio class timetable in Singapore time.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

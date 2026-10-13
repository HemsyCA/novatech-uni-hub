import type { ReactNode } from "react";
import { Navbar } from "@/components/landing/Navbar";
import { Footer } from "@/components/landing/Footer";

export function PageLayout({ children }: { children: ReactNode }) {
  return (
    <div className="font-mono min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <main className="pt-20">{children}</main>
      <Footer />
    </div>
  );
}

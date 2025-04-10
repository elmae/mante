import { Metadata } from "next";
import {
  Navbar,
  Hero,
  Features,
  HowItWorks,
  Footer,
} from "@/components/landing";

export const metadata: Metadata = {
  title: "CMMS - Sistema de Mantenimiento de ATMs",
  description:
    "Sistema especializado para gestión de mantenimiento preventivo y correctivo de ATMs",
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <Footer />
    </div>
  );
}

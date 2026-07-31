import { Navbar } from "@/components/landing/Navbar";
import { RobotsSection } from "@/components/landing/RobotsSection";
import { Footer } from "@/components/landing/Footer";

const Robots = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Navbar />
      <main className="pt-20">
        <RobotsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Robots;

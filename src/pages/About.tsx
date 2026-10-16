import { PageLayout } from "@/components/landing/PageLayout";
import { AboutSection } from "@/components/landing/AboutSection";
import { TeamSection } from "@/components/landing/TeamSection";
import { useScrollToHash } from "@/hooks/use-scroll-to-hash";

const About = () => {
  useScrollToHash();

  return (
    <PageLayout>
      <AboutSection />
      <TeamSection index="03" />
    </PageLayout>
  );
};

export default About;

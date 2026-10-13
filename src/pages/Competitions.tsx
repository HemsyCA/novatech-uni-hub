import { PageLayout } from "@/components/landing/PageLayout";
import { CompetitionsSection } from "@/components/landing/CompetitionsSection";
import { useScrollToHash } from "@/hooks/use-scroll-to-hash";

const Competitions = () => {
  useScrollToHash();

  return (
    <PageLayout>
      <CompetitionsSection />
    </PageLayout>
  );
};

export default Competitions;

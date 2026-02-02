import {
  Header,
  HeroSection,
  PackagesSection,
  LevelsSection,
  TeamSection,
  BurningSection,
  HowItWorksSection,
  BottomNav,
} from '@/components/home';

// New Sections
import { DigitalTitansSection } from '@/components/sections/DigitalTitansSection';
import { CrofuerTechSection } from '@/components/sections/CrofuerTechSection';
import { FeaturesSection } from '@/components/sections/FeaturesSection';
import { RoadmapSection } from '@/components/sections/RoadmapSection';
import { HowToJoinSection } from '@/components/sections/HowToJoinSection';
import { FooterCTASection } from '@/components/sections/FooterCTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-16 sm:pb-20">
      <Header />
      <div id="hero">
        <HeroSection />
      </div>

      {/* New Sections */}
      <div id="titans">
        <DigitalTitansSection />
      </div>
      <div id="crofuer">
        <CrofuerTechSection />
      </div>
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="roadmap">
        <RoadmapSection />
      </div>
      <div id="join">
        <HowToJoinSection />
      </div>

      {/* Legacy Sections */}
      {/* <div id="packages">
        <PackagesSection />
      </div> */}
      {/* <div id="levels">
        <LevelsSection />
      </div> */}
      {/* <div id="team">
        <TeamSection />
      </div> */}
      {/* <div id="burn">
        <BurningSection />
      </div> */}

      {/* <HowItWorksSection /> */}

      {/* Footer CTA */}
      <FooterCTASection />

      <BottomNav />
    </div>
  );
}

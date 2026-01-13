import {
  Header,
  HeroSection,
  FeaturesSection,
  PackagesSection,
  LevelsSection,
  TeamSection,
  BurningSection,
  HowItWorksSection,
  CTASection,
  BottomNav,
} from '@/components/home';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0F172A] pb-16 sm:pb-20">
      <Header />
      <HeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <div id="packages">
        <PackagesSection />
      </div>
      <div id="levels">
        <LevelsSection />
      </div>
      <div id="team">
        <TeamSection />
      </div>
      <div id="burn">
        <BurningSection />
      </div>
      <HowItWorksSection />
      <CTASection />
      <BottomNav />
    </div>
  );
}

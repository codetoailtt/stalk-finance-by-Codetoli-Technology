import { HeroSection } from '@/components/landing/hero-section'
import { AboutSection } from '@/components/landing/about-section'
import { FeaturesSection } from '@/components/landing/features-section'
import { WorkflowSection } from '@/components/landing/workflow-section'
import { ServicesSection } from '@/components/landing/services-section'
import { FAQSection } from '@/components/landing/faq-section'
import { ContactSection } from '@/components/landing/contact-section'
import { Header } from '@/components/landing/header'
import { Footer } from '@/components/landing/footer'

// This page uses ISR for SEO optimization
export const revalidate = 60

export default async function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <WorkflowSection />
      <ServicesSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
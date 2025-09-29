import { Navbar } from './Navbar'
import { Hero } from './Hero'
import { ValuePropositions } from './ValuePropositions'
import { ProductOverview } from './ProductOverview'
import { Features } from './Features'
import { Testimonials } from './Testimonials'
import { Pricing } from './Pricing'
import { FinalCTA } from './FinalCTA'
import { Footer } from './Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 custom-scrollbar">
      <Navbar />
      <Hero />
      <ValuePropositions />
      <ProductOverview />
      <Features />
      <Testimonials />
      <Pricing />
      <FinalCTA />
      <Footer />
    </div>
  )
}
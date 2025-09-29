import { Card, CardContent } from '@/components/ui/card'

const valueProps = [
  {
    icon: '🤖',
    title: 'AI-Powered Recommendations',
    description: 'Our advanced machine learning algorithms analyze your viewing history and preferences to suggest movies you\'ll love.',
    highlight: 'Smart & Personalized'
  },
  {
    icon: '⚡',
    title: 'Lightning Fast Discovery',
    description: 'Find your next favorite movie in seconds, not hours. Skip the endless scrolling and get straight to watching.',
    highlight: 'Save Time'
  },
  {
    icon: '🎯',
    title: 'Mood-Based Matching',
    description: 'Whether you want comedy, drama, or action - tell us your mood and we\'ll find the perfect match for your evening.',
    highlight: 'Perfect Fit'
  },
  {
    icon: '📊',
    title: 'Smart Analytics',
    description: 'Track your viewing patterns, discover new genres, and get insights into your movie preferences over time.',
    highlight: 'Self Discovery'
  }
]

export function ValuePropositions() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            Why Choose Moveere?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            We're not just another movie database. We're your personal movie curator, designed to understand your unique taste and save you time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {valueProps.map((prop, index) => (
            <Card key={index} className="group relative overflow-hidden transition-all duration-300 hover:shadow-elegant hover:-translate-y-1 border">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {prop.icon}
                  </div>
                  <div className="inline-block px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-full mb-4">
                    {prop.highlight}
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-card-foreground mb-3">
                  {prop.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed">
                  {prop.description}
                </p>
              </CardContent>

              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-500/5 dark:from-primary/10 dark:to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Statistics Section */}
        <div className="mt-20 bg-gradient-to-r from-muted/50 to-muted/80 rounded-2xl p-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                95%
              </div>
              <div className="text-muted-foreground">
                Accuracy Rate
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">
                2M+
              </div>
              <div className="text-muted-foreground">
                Movies in Database
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                100K+
              </div>
              <div className="text-muted-foreground">
                Happy Users
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
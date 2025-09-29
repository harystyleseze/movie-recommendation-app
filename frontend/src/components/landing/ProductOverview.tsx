import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type StepVisual = {
  type: 'rating'
  content: string[]
} | {
  type: 'processing'
  content: string[]
} | {
  type: 'results'
  content: { title: string; match: string }[]
}

type Step = {
  number: string
  title: string
  description: string
  visual: StepVisual
}

const steps: Step[] = [
  {
    number: '1',
    title: 'Tell Us Your Preferences',
    description: 'Rate a few movies, select your favorite genres, and set your mood for the perfect viewing experience.',
    visual: {
      type: 'rating',
      content: ['Action', 'Comedy', 'Drama', 'Sci-Fi']
    }
  },
  {
    number: '2',
    title: 'AI Analyzes Your Taste',
    description: 'Our machine learning algorithm processes millions of data points to understand your unique preferences.',
    visual: {
      type: 'processing',
      content: ['Analyzing patterns...', 'Finding similarities...', 'Generating matches...']
    }
  },
  {
    number: '3',
    title: 'Get Perfect Recommendations',
    description: 'Receive a curated list of movies ranked by how much you\'ll love them, with detailed explanations.',
    visual: {
      type: 'results',
      content: [
        { title: 'Inception', match: '98%' },
        { title: 'The Matrix', match: '95%' },
        { title: 'Interstellar', match: '92%' }
      ]
    }
  }
]

export function ProductOverview() {
  return (
    <section className="py-20 bg-gradient-to-br from-muted/30 to-primary/10 dark:from-gray-950 dark:to-primary/5">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 text-balance">
            How Moveere Works
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get personalized movie recommendations in three simple steps. No more endless scrolling or disappointing choices.
          </p>
        </div>

        <div className="space-y-16">
          {steps.map((step, index) => (
            <div key={index} className={`flex flex-col lg:flex-row items-center gap-12 ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}>
              {/* Content */}
              <div className="lg:w-1/2 space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center text-primary-foreground font-bold text-xl">
                    {step.number}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-foreground">
                    {step.title}
                  </h3>
                </div>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
                {index === 0 && (
                  <Button className="mt-4">
                    Try It Now - It's Free
                  </Button>
                )}
              </div>

              {/* Visual */}
              <div className="lg:w-1/2">
                <Card className="bg-card shadow-elegant border max-w-md mx-auto">
                  <CardContent className="p-8">
                    {step.visual.type === 'rating' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 mb-4">Select your favorite genres:</h4>
                        <div className="space-y-3">
                          {(step.visual.content as string[]).map((genre, genreIndex) => (
                            <div key={genreIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <span className="text-gray-700">{genre}</span>
                              <div className="flex space-x-1">
                                {[...Array(5)].map((_, starIndex) => (
                                  <span key={starIndex} className={`text-lg ${starIndex < 4 - genreIndex ? 'text-yellow-400' : 'text-gray-300'}`}>
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.visual.type === 'processing' && (
                      <div className="space-y-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                          <h4 className="font-semibold text-gray-800">AI Processing</h4>
                        </div>
                        <div className="space-y-3">
                          {(step.visual.content as string[]).map((text, textIndex) => (
                            <div key={textIndex} className="flex items-center space-x-3">
                              <div className={`w-2 h-2 rounded-full ${textIndex === 0 ? 'bg-green-500' : textIndex === 1 ? 'bg-blue-500 animate-pulse' : 'bg-gray-300'}`}></div>
                              <span className={`text-sm ${textIndex <= 1 ? 'text-gray-700' : 'text-gray-400'}`}>{text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.visual.type === 'results' && (
                      <div className="space-y-4">
                        <h4 className="font-semibold text-gray-800 mb-4">Your Recommendations:</h4>
                        <div className="space-y-3">
                          {(step.visual.content as { title: string; match: string }[]).map((movie, movieIndex) => (
                            <div key={movieIndex} className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
                                  <span className="text-xs text-gray-600">IMG</span>
                                </div>
                                <span className="font-medium text-gray-800">{movie.title}</span>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-green-600">{movie.match}</div>
                                <div className="text-xs text-gray-500">match</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Ready to discover your next favorite movie?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of movie lovers who never run out of great films to watch.
            </p>
            <Button size="lg" className="text-lg px-8 py-3">
              Get Started Free
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
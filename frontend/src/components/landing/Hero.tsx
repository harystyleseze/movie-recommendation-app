import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-blue-50 via-background to-purple-50 dark:from-gray-900 dark:via-background dark:to-purple-900/20 flex items-center transition-colors duration-300">
      <div className="container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Discover Your Next
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600 dark:from-primary dark:to-purple-400">
                  Favorite Movie
                </span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto lg:mx-0">
                Get personalized movie recommendations powered by AI. Find films that match your taste, mood, and preferences from millions of titles.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="text-lg px-8 py-3">
                Start Discovering
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-3 border-gray-300 hover:border-gray-400"
              >
                Watch Demo
              </Button>
            </div>

            {/* Social Proof */}
            <div className="pt-8">
              <p className="text-sm text-muted-foreground mb-4">Trusted by over 100,000 movie lovers</p>
              <div className="flex justify-center lg:justify-start items-center space-x-6 opacity-60">
                <div className="text-sm font-semibold text-muted-foreground">★★★★★ 4.8/5</div>
                <div className="w-px h-4 bg-border"></div>
                <div className="text-sm text-muted-foreground">Featured on Product Hunt</div>
              </div>
            </div>
          </div>

          {/* Visual/Mockup */}
          <div className="relative">
            <div className="relative bg-card rounded-2xl shadow-elegant border p-8 max-w-md mx-auto backdrop-blur-sm">
              {/* Mock movie recommendation interface */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-r from-primary to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-sm">M</span>
                  </div>
                  <h3 className="font-semibold text-card-foreground">Moveere AI</h3>
                </div>

                {/* Mock recommendation cards */}
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                      <div className="w-16 h-20 bg-gradient-to-br from-muted to-muted-foreground/20 rounded flex items-center justify-center">
                        <span className="text-xs text-muted-foreground">Movie {i}</span>
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-2 bg-muted/70 rounded w-1/2"></div>
                        <div className="flex items-center space-x-1">
                          <div className="flex text-yellow-400 text-xs">★★★★★</div>
                          <span className="text-xs text-muted-foreground">{95 - i * 3}% match</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating elements for visual appeal */}
              <div className="absolute -top-6 -right-6 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <span className="text-yellow-800 text-xl">🎬</span>
              </div>
              <div className="absolute -bottom-4 -left-4 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white text-sm">✨</span>
              </div>
            </div>

            {/* Background decoration */}
            <div className="absolute -z-10 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-primary/20 to-purple-600/20 dark:from-primary/10 dark:to-purple-600/10 rounded-full blur-3xl opacity-60 dark:opacity-40"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
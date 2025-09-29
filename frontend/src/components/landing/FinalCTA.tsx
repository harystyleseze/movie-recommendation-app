import { Button } from '@/components/ui/button'

export function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="text-center text-white max-w-4xl mx-auto">
          {/* Main heading */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Stop Wasting Time on
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">
              Bad Movies
            </span>
          </h2>

          <p className="text-xl md:text-2xl mb-8 opacity-90 leading-relaxed">
            Join over 100,000 movie lovers who never run out of great films to watch.
            Your perfect movie is just one click away.
          </p>

          {/* Key benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Instant Recommendations</h3>
              <p className="text-white/80 text-sm">Get personalized movie suggestions in seconds, not hours of browsing.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🎯</div>
              <h3 className="text-xl font-semibold mb-2">95% Accuracy Rate</h3>
              <p className="text-white/80 text-sm">Our AI has a proven track record of suggesting movies you'll love.</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="text-3xl mb-3">🎬</div>
              <h3 className="text-xl font-semibold mb-2">2M+ Movies</h3>
              <p className="text-white/80 text-sm">Discover hidden gems from the world's largest movie database.</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-gray-100 font-semibold shadow-xl">
                Start Discovering Movies Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-600 transition-all duration-300"
              >
                Watch 2-Min Demo
              </Button>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span>Free forever plan available</span>
              </div>
              <div className="hidden sm:block w-px h-4 bg-white/30"></div>
              <div className="flex items-center space-x-2">
                <span className="text-green-300">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>

          {/* Urgency/Social proof */}
          <div className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between text-center sm:text-left">
              <div>
                <h4 className="font-semibold mb-1">Join the community today</h4>
                <p className="text-white/80 text-sm">
                  <span className="font-semibold text-yellow-300">3,247</span> people signed up this week
                </p>
              </div>
              <div className="mt-4 sm:mt-0 text-right">
                <div className="flex -space-x-2">
                  {['👩‍💼', '👨‍🎓', '👩‍🎨', '👨‍💻', '👩‍🔬'].map((emoji, index) => (
                    <div key={index} className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-sm border-2 border-blue-600">
                      {emoji}
                    </div>
                  ))}
                </div>
                <div className="text-xs opacity-75 mt-1">And thousands more...</div>
              </div>
            </div>
          </div>

          {/* Final reassurance */}
          <div className="mt-8">
            <p className="text-white/80 text-sm">
              🔒 Your data is secure and private • 🌟 Rated 4.9/5 by users • 📱 Works on all devices
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
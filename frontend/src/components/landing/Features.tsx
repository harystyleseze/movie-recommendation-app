import { Card, CardContent } from '@/components/ui/card'

const features = [
  {
    icon: '🎬',
    title: 'Vast Movie Database',
    description: 'Access to over 2 million movies from around the world, including classics, blockbusters, and hidden gems.',
    details: ['Latest releases updated daily', 'International cinema', 'Classic film collection', 'Independent films']
  },
  {
    icon: '🔥',
    title: 'Trending & Hot Picks',
    description: 'Stay updated with what\'s trending and discover movies that are making waves in the film community.',
    details: ['Real-time trending data', 'Social media buzz tracking', 'Critics\' choice highlights', 'Festival winners']
  },
  {
    icon: '📱',
    title: 'Multi-Platform Sync',
    description: 'Your preferences and watchlist sync across all your devices - phone, tablet, laptop, and smart TV.',
    details: ['Cross-device synchronization', 'Offline recommendations', 'Smart TV integration', 'Mobile-first design']
  },
  {
    icon: '🎯',
    title: 'Advanced Filtering',
    description: 'Filter by genre, decade, rating, duration, language, and even specific moods or themes.',
    details: ['20+ filter categories', 'Mood-based search', 'Runtime preferences', 'Content rating filters']
  },
  {
    icon: '👥',
    title: 'Social Features',
    description: 'Share recommendations with friends, create group watchlists, and see what your network is watching.',
    details: ['Friend recommendations', 'Group watchlists', 'Social sharing', 'Community reviews']
  },
  {
    icon: '📊',
    title: 'Viewing Analytics',
    description: 'Track your viewing habits, discover patterns in your preferences, and get insights into your movie journey.',
    details: ['Viewing statistics', 'Genre preferences', 'Rating patterns', 'Time spent watching']
  },
  {
    icon: '⭐',
    title: 'Smart Ratings',
    description: 'Our AI combines critic scores, user ratings, and your personal taste to give you the most relevant ratings.',
    details: ['Personalized scores', 'Critic aggregation', 'User consensus', 'Taste-adjusted ratings']
  },
  {
    icon: '🔒',
    title: 'Privacy First',
    description: 'Your data stays private. We use advanced encryption and never share your personal viewing preferences.',
    details: ['End-to-end encryption', 'No data selling', 'GDPR compliant', 'Anonymous analytics']
  }
]

export function Features() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Movie Lovers
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to discover, track, and enjoy movies like never before. Built by movie enthusiasts, for movie enthusiasts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="group h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-2 border-gray-100">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="mb-6">
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                </div>

                <p className="text-gray-600 mb-6 flex-grow">
                  {feature.description}
                </p>

                <div className="space-y-2">
                  {feature.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="flex items-center text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-3 opacity-60"></div>
                      {detail}
                    </div>
                  ))}
                </div>

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature highlight */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            More Features Coming Soon
          </h3>
          <p className="text-xl mb-6 opacity-90">
            We're constantly innovating to make your movie discovery experience even better.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl mb-2">🤖</div>
              <div className="font-semibold">Voice Search</div>
              <div className="text-sm opacity-80">Find movies by speaking</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🎥</div>
              <div className="font-semibold">Video Previews</div>
              <div className="text-sm opacity-80">Watch trailers instantly</div>
            </div>
            <div>
              <div className="text-3xl mb-2">🌍</div>
              <div className="font-semibold">Global Availability</div>
              <div className="text-sm opacity-80">Where to watch worldwide</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
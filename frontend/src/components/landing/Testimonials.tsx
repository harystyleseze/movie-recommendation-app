import { Card, CardContent } from '@/components/ui/card'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Film Critic',
    company: 'Movie Weekly',
    image: '👩‍💼',
    quote: 'Moveere has transformed how I discover films. The AI recommendations are so accurate, it\'s like having a personal film curator who truly understands my taste.',
    rating: 5,
    featured: true
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Streaming Enthusiast',
    company: 'Netflix Power User',
    image: '👨‍🎓',
    quote: 'I used to spend hours scrolling through streaming services. Now I find perfect movies in minutes. The mood-based recommendations are genius!',
    rating: 5,
    featured: false
  },
  {
    name: 'Emma Thompson',
    role: 'Movie Blogger',
    company: 'CinemaScope Blog',
    image: '👩‍💻',
    quote: 'The social features are amazing. My friends and I create group watchlists for movie nights. It has made our movie selection so much better.',
    rating: 5,
    featured: false
  },
  {
    name: 'David Park',
    role: 'Film Student',
    company: 'UCLA Film School',
    image: '👨‍🎨',
    quote: 'As a film student, I need to watch diverse movies. Moveere\'s advanced filtering and international cinema suggestions are invaluable for my studies.',
    rating: 5,
    featured: false
  },
  {
    name: 'Lisa Wang',
    role: 'Busy Parent',
    company: 'Working Mom',
    image: '👩‍👧',
    quote: 'With limited free time, every movie choice matters. Moveere ensures I never waste 2 hours on a bad film. The recommendations are spot-on!',
    rating: 5,
    featured: true
  },
  {
    name: 'Alex Johnson',
    role: 'Tech Professional',
    company: 'Google',
    image: '👨‍💻',
    quote: 'The AI behind this app is impressive. It learns from my viewing patterns and consistently suggests movies I end up loving. Best recommendation engine I\'ve used.',
    rating: 5,
    featured: false
  }
]

const companies = [
  { name: 'TechCrunch', logo: 'TC' },
  { name: 'Product Hunt', logo: 'PH' },
  { name: 'The Verge', logo: 'TV' },
  { name: 'Wired', logo: 'W' },
  { name: 'Fast Company', logo: 'FC' }
]

export function Testimonials() {
  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Loved by Movie Enthusiasts Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of movie lovers who have transformed their film discovery experience with Moveere.
          </p>

          {/* Overall Rating */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div className="flex text-yellow-400 text-2xl">
              ★★★★★
            </div>
            <div className="text-gray-600">
              <span className="text-2xl font-bold text-gray-900">4.9</span> out of 5
            </div>
            <div className="text-gray-400">•</div>
            <div className="text-gray-600">
              Over <span className="font-semibold">10,000</span> reviews
            </div>
          </div>
        </div>

        {/* Featured Testimonials */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          {testimonials.filter(t => t.featured).map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-2xl border-0 relative overflow-hidden">
              <CardContent className="p-8">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-gray-600">{testimonial.role}</p>
                    <p className="text-gray-500 text-sm">{testimonial.company}</p>
                  </div>
                  <div className="flex text-yellow-400">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                </div>
                <blockquote className="text-gray-700 text-lg leading-relaxed italic">
                  "{testimonial.quote}"
                </blockquote>

                {/* Quote decoration */}
                <div className="absolute top-6 right-6 text-6xl text-blue-100 font-serif">"</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Grid of Regular Testimonials */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {testimonials.filter(t => !t.featured).map((testimonial, index) => (
            <Card key={index} className="bg-white shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">{testimonial.image}</div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-gray-900">{testimonial.name}</h5>
                    <p className="text-gray-600 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-3 text-sm">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 text-sm leading-relaxed flex-grow">
                  "{testimonial.quote}"
                </blockquote>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Press mentions */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-8">
            Featured In
          </h3>
          <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div key={index} className="flex items-center space-x-2 text-gray-600">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center font-bold text-sm">
                  {company.logo}
                </div>
                <span className="font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Join the Community
            </h3>
            <p className="text-gray-600 mb-6">
              Become part of a community that's passionate about great movies. Your perfect film is just one click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Free to start</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span className="text-green-500">✓</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
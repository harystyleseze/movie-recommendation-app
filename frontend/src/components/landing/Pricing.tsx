import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for casual movie watchers',
    features: [
      '10 personalized recommendations per day',
      'Basic genre filtering',
      'Mobile app access',
      'Community ratings',
      'Standard support'
    ],
    limitations: [
      'Limited advanced filters',
      'No social features',
      'Basic analytics only'
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'gray'
  },
  {
    name: 'Starter',
    price: '$9',
    period: 'per month',
    description: 'Great for regular movie enthusiasts',
    features: [
      'Unlimited personalized recommendations',
      'Advanced filtering & search',
      'Mood-based recommendations',
      'Watchlist synchronization',
      'Priority support',
      'No advertisements'
    ],
    limitations: [
      'Limited social features',
      'Basic viewing analytics'
    ],
    cta: 'Start 7-Day Free Trial',
    popular: false,
    color: 'blue'
  },
  {
    name: 'Pro',
    price: '$19',
    period: 'per month',
    description: 'Best for serious film lovers',
    features: [
      'Everything in Starter',
      'Full social features & friend recommendations',
      'Advanced viewing analytics',
      'Group watchlists',
      'Early access to new features',
      'Premium customer support',
      'API access for developers'
    ],
    limitations: [],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    color: 'purple'
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For teams, educators, and organizations',
    features: [
      'Everything in Pro',
      'Team management & admin controls',
      'Custom integrations',
      'Bulk user management',
      'Advanced reporting & analytics',
      'Dedicated account manager',
      'Custom training & onboarding',
      'SLA guarantees'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'green'
  }
]

export function Pricing() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Perfect Plan
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Start free and upgrade as your movie discovery needs grow. All plans include our core AI recommendation engine.
          </p>

          {/* Toggle (Future feature) */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className="text-gray-600">Monthly</span>
            <div className="relative">
              <div className="w-12 h-6 bg-gray-200 rounded-full flex items-center">
                <div className="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"></div>
              </div>
            </div>
            <span className="text-gray-400">Yearly</span>
            <Badge variant="secondary" className="text-xs">
              Save 20%
            </Badge>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 gap-8 mb-16">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative h-full flex flex-col ${
              plan.popular
                ? 'border-2 border-purple-500 shadow-2xl scale-105 bg-gradient-to-b from-white to-purple-50'
                : 'border-gray-200 hover:shadow-lg transition-shadow duration-300'
            }`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-1 text-sm font-semibold">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className={`text-4xl font-bold ${
                    plan.color === 'purple' ? 'text-purple-600' :
                    plan.color === 'blue' ? 'text-blue-600' :
                    plan.color === 'green' ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {plan.price}
                  </span>
                  <span className="text-gray-500 text-lg ml-1">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </CardHeader>

              <CardContent className="flex-grow flex flex-col">
                <div className="space-y-4 mb-8 flex-grow">
                  {/* Features */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Included:</h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start text-sm text-gray-600">
                          <span className="text-green-500 mr-3 mt-0.5">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Limitations */}
                  {plan.limitations.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Limitations:</h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, limitationIndex) => (
                          <li key={limitationIndex} className="flex items-start text-sm text-gray-500">
                            <span className="text-gray-400 mr-3 mt-0.5">•</span>
                            {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Button
                  size="lg"
                  className={`w-full ${
                    plan.popular
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : plan.color === 'blue'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : plan.color === 'green'
                      ? 'bg-green-600 hover:bg-green-700'
                      : ''
                  }`}
                  variant={plan.name === 'Free' ? 'outline' : 'default'}
                >
                  {plan.cta}
                </Button>

                {plan.name !== 'Free' && plan.name !== 'Enterprise' && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    No credit card required
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h3>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h4>
              <p className="text-gray-600 text-sm">We accept all major credit cards, PayPal, and Apple/Google Pay for your convenience.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Is there a long-term contract?</h4>
              <p className="text-gray-600 text-sm">No, all our plans are month-to-month. You can cancel anytime with no penalties or fees.</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Do you offer student discounts?</h4>
              <p className="text-gray-600 text-sm">Yes! Students get 50% off Pro plans with a valid .edu email address. Contact support for details.</p>
            </div>
          </div>
        </div>

        {/* Trust signals */}
        <div className="text-center mt-12">
          <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <span className="text-green-500">🔒</span>
              <span>Secure payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-500">↩️</span>
              <span>30-day money back</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-purple-500">⚡</span>
              <span>Instant activation</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-orange-500">📞</span>
              <span>24/7 support</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
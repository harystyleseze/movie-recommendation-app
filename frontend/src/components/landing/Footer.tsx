const footerSections = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'API', href: '#api' },
      { name: 'Mobile App', href: '#mobile' },
      { name: 'Desktop App', href: '#desktop' }
    ]
  },
  {
    title: 'Resources',
    links: [
      { name: 'Blog', href: '#blog' },
      { name: 'Help Center', href: '#help' },
      { name: 'Movie Database', href: '#database' },
      { name: 'Community', href: '#community' },
      { name: 'Status', href: '#status' }
    ]
  },
  {
    title: 'Company',
    links: [
      { name: 'About Us', href: '#about' },
      { name: 'Careers', href: '#careers' },
      { name: 'Press Kit', href: '#press' },
      { name: 'Contact', href: '#contact' },
      { name: 'Partners', href: '#partners' }
    ]
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '#privacy' },
      { name: 'Terms of Service', href: '#terms' },
      { name: 'Cookie Policy', href: '#cookies' },
      { name: 'DMCA', href: '#dmca' },
      { name: 'Accessibility', href: '#accessibility' }
    ]
  }
]

const socialLinks = [
  { name: 'Twitter', href: '#twitter', icon: '🐦' },
  { name: 'Instagram', href: '#instagram', icon: '📸' },
  { name: 'Facebook', href: '#facebook', icon: '👥' },
  { name: 'YouTube', href: '#youtube', icon: '📺' },
  { name: 'LinkedIn', href: '#linkedin', icon: '💼' }
]

export function Footer() {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white transition-colors duration-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-6 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-2xl font-bold">Moveere</span>
            </div>
            <p className="text-gray-300 dark:text-gray-400 leading-relaxed mb-6 max-w-md">
              Your AI-powered movie recommendation companion. Discover your next favorite film with personalized suggestions that match your unique taste.
            </p>

            {/* Contact info */}
            <div className="space-y-2 text-sm text-gray-300 dark:text-gray-400 mb-6">
              <div className="flex items-center space-x-2">
                <span>📧</span>
                <span>hello@moveere.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>📞</span>
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🏢</span>
                <span>San Francisco, CA</span>
              </div>
            </div>

            {/* Social links */}
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center transition-colors duration-300"
                  title={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-white mb-4">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors duration-300 text-sm"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter signup */}
        <div className="border-t border-gray-800 pt-8 mt-12">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="mb-6 lg:mb-0">
              <h4 className="text-xl font-semibold mb-2">Stay in the loop</h4>
              <p className="text-gray-300 dark:text-gray-400 max-w-md">
                Get the latest movie recommendations, features updates, and exclusive content delivered to your inbox.
              </p>
            </div>
            <div className="flex w-full lg:w-auto max-w-md">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-r-lg font-semibold transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <div className="mb-4 md:mb-0">
              <p>&copy; 2024 Moveere, Inc. All rights reserved.</p>
            </div>

            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              {/* Trust badges */}
              <div className="flex items-center space-x-4 text-xs">
                <div className="flex items-center space-x-1">
                  <span className="text-green-400">🔒</span>
                  <span>SSL Secured</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-blue-400">⚡</span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-purple-400">🛡️</span>
                  <span>GDPR Compliant</span>
                </div>
              </div>

              {/* Version/Build info */}
              <div className="text-xs text-gray-500">
                v2.1.0 • Built with ❤️ for movie lovers
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
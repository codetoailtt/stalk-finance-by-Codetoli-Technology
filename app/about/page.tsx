import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Shield, Users, Award, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'About Us - Stalk Finance',
  description: 'Learn about Stalk Finance - Your trusted partner for quick and easy financing solutions',
  keywords: 'about Stalk Finance, company profile, quick loans, consumer finance, mobile phone loans, furniture loans, electronics loans, EMI, secure finance, customer support, India, loan approval, flexible repayment, partner network',
  openGraph: {
    title: 'About Us - Stalk Finance',
    description: 'Learn about Stalk Finance - Your trusted partner for quick and easy financing solutions',
    url: 'https://stalkfinance.com/about',
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - Stalk Finance',
    description: 'Learn about Stalk Finance - Your trusted partner for quick and easy financing solutions',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft size={16} className="mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-2">
              <img 
                src="/assets/logo.png" 
                alt="Stalk Finance logo" 
                className="w-32 h-32 object-contain"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              About Stalk Finance
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              We're on a mission to make financing accessible, quick, and hassle-free for everyone. 
              From the latest smartphones to home furniture, we help you get what you need with 
              flexible payment options.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Founded with the vision of democratizing access to consumer financing, Stalk Finance 
                  Private Limited has been serving customers across India with innovative loan solutions 
                  since our inception.
                </p>
                <p>
                  We recognized that traditional lending processes were often slow, complex, and 
                  inaccessible to many. That's why we built a platform that leverages technology 
                  to provide instant loan approvals with minimal documentation.
                </p>
                <p>
                  Today, we're proud to have helped thousands of customers fulfill their dreams of 
                  owning the latest gadgets, upgrading their homes, and accessing the products they 
                  need through our flexible financing solutions.
                </p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-8">
              <div className="grid grid-cols-2 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                  <div className="text-gray-600">Customers Served</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">₹2Cr+</div>
                  <div className="text-gray-600">Loans Disbursed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
                  <div className="text-gray-600">Approval Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">10 Min</div>
                  <div className="text-gray-600">Avg. Approval Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These core values guide everything we do and shape our commitment to our customers.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Trust & Security</h3>
              <p className="text-gray-600">
                We prioritize the security of your personal and financial information with 
                bank-grade encryption and compliance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Speed & Efficiency</h3>
              <p className="text-gray-600">
                Our technology-driven approach ensures quick loan approvals and seamless 
                customer experience.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer First</h3>
              <p className="text-gray-600">
                Every decision we make is centered around providing the best possible 
                experience for our customers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award size={32} className="text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from our products to our 
                customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Offer */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive financing solutions for all your consumer needs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Mobile Phone Loans</h3>
              <p className="text-gray-600 mb-4">
                Get the latest smartphones with easy EMI options. Loan amounts up to ₹1.5 lakhs 
                with flexible tenure options.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Latest iPhone and Android devices</li>
                <li>• 3-24 months repayment tenure</li>
                <li>• Instant approval process</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">🪑</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Furniture Financing</h3>
              <p className="text-gray-600 mb-4">
                Transform your home with our furniture loans. Up to ₹5 lakhs for all your 
                home and office furniture needs.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Home and office furniture</li>
                <li>• 6-36 months repayment options</li>
                <li>• Partner with top furniture brands</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border">
              <div className="text-4xl mb-4">💻</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Electronics & Appliances</h3>
              <p className="text-gray-600 mb-4">
                Laptops, TVs, kitchen appliances, and more. Financing up to ₹3 lakhs for 
                all your electronic needs.
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Laptops, TVs, and gaming consoles</li>
                <li>• Kitchen and home appliances</li>
                <li>• 3-24 months flexible EMIs</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Stalk Finance?</h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">1</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick & Easy Process</h3>
                  <p className="text-gray-600">
                    Our streamlined application process takes just 5 minutes, with instant 
                    approval decisions powered by advanced algorithms.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">2</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Competitive Rates</h3>
                  <p className="text-gray-600">
                    We offer some of the most competitive interest rates in the market, 
                    starting from just 12% to 18% per annum.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">3</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Flexible Terms</h3>
                  <p className="text-gray-600">
                    Choose repayment terms that suit your budget, with options ranging 
                    from 3 to 36 months depending on the loan category.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-blue-600 font-bold text-sm">4</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Hidden Charges</h3>
                  <p className="text-gray-600">
                    Complete transparency in pricing with no hidden fees. What you see 
                    is what you pay, with clear terms and conditions.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
              <p className="text-gray-700 mb-6">
                Join thousands of satisfied customers who have chosen Stalk Finance for 
                their financing needs. Apply now and get instant approval!
              </p>
              <div className="space-y-3">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/signup">Apply for Loan</Link>
                </Button>
                <Button variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Have Questions?</h2>
            <p className="text-gray-600 mb-6">
              Our customer support team is here to help you with any questions about our 
              loan products or application process.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                <Link href="/contact">Contact Support</Link>
              </Button>
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                <span>View FAQ</span>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
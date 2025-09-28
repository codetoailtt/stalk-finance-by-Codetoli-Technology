import { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, ExternalLink, Store, Users, Award, TrendingUp, MapPin, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Our Shop Partners - Stalk Finance',
  description: 'Discover our trusted retail Shop Partners for mobile phones, furniture, electronics and more',
  keywords: 'Stalk Finance Shop Partners, retail Shop Partners, partner stores, mobile phone retailers, furniture retailers, electronics retailers, EMI, consumer finance, India, partner network, verified stores, shop with EMI',
  openGraph: {
    title: 'Our Shop Partners - Stalk Finance',
    description: 'Discover our trusted retail Shop Partners for mobile phones, furniture, electronics and more',
    url: 'https://stalkfinance.com/partners',
    siteName: 'Stalk Finance',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Our Shop Partners - Stalk Finance',
    description: 'Discover our trusted retail Shop Partners for mobile phones, furniture, electronics and more',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function PartnersPage() {
  const partners = [
    {
      id: 1,
      name: 'TechMart Electronics',
      logo: 'https://images.pexels.com/photos/356056/pexels-photo-356056.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      category: 'Electronics & Mobile',
      description: 'Leading retailer for smartphones, laptops, and consumer electronics with multiple stores.',
      website: 'https://techmart.com',
      established: '2015',
      locations: '5+ Cities',
      specialties: ['Latest Smartphones', 'Gaming Laptops', 'Smart TVs', 'Audio Systems']
    },
    {
      id: 2,
      name: 'HomeFurni Solutions',
      logo: 'https://images.pexels.com/photos/1350789/pexels-photo-1350789.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      category: 'Furniture & Home',
      description: 'Premium furniture retailer offering modern and traditional designs for homes and offices.',
      website: 'https://homefurni.com',
      established: '2012',
      locations: '3+ Cities',
      specialties: ['Living Room Sets', 'Office Furniture', 'Bedroom Collections', 'Kitchen Furniture']
    },
    {
      id: 3,
      name: 'GadgetZone Pro',
      logo: 'https://images.pexels.com/photos/325153/pexels-photo-325153.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      category: 'Gadgets & Accessories',
      description: 'Specialized in latest gadgets, smartwatches, headphones, and tech accessories.',
      website: 'https://gadgetzone.com',
      established: '2018',
      locations: '4+ Cities',
      specialties: ['Smartwatches', 'Wireless Headphones', 'Gaming Accessories', 'Phone Cases']
    },
    {
      id: 4,
      name: 'ApplianceHub India',
      logo: 'https://images.pexels.com/photos/4239091/pexels-photo-4239091.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      category: 'Home Appliances',
      description: 'Complete range of kitchen appliances, washing machines, refrigerators, and home essentials.',
      website: 'https://appliancehub.com',
      established: '2010',
      locations: '6+ Cities',
      specialties: ['Kitchen Appliances', 'Washing Machines', 'Refrigerators', 'Air Conditioners']
    },
    {
      id: 5,
      name: 'LifestylePlus Retail',
      logo: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=2',
      category: 'Lifestyle & Fashion',
      description: 'Fashion, lifestyle products, and personal accessories with trendy collections.',
      website: 'https://lifestyleplus.com',
      established: '2016',
      locations: '3+ Cities',
      specialties: ['Fashion Accessories', 'Lifestyle Products', 'Personal Care', 'Home Decor']
    }
  ]

  const stats = [
    { label: 'Partner Stores', value: '25+', icon: Store },
    { label: 'Cities Covered', value: '15+', icon: Users },
    { label: 'Customer Satisfaction', value: '98%', icon: Award },
    { label: 'Monthly Transactions', value: '200+', icon: TrendingUp },
  ]

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
      <section className="bg-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Trusted Shop Partners
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
            We've partnered with reliable retailers to bring you quality products 
            with flexible financing options. Shop from verified stores with confidence.
          </p>
        </div>
      </section>


      {/* Shop Partners Grid */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Featured Shop Partners
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Explore our network of verified retail Shop Partners offering quality products 
              with instant financing options.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {partners.map((partner) => (
              <Card key={partner.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                      <img 
                        src={partner.logo} 
                        alt={`${partner.name} logo`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                        {partner.name}
                      </h3>
                    </div>
                  </div>
                  
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                    {partner.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 sm:p-6 pt-0"></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Shop Partnership Benefits */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Our Shop Partners Choose Us
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              We provide value to both customers and retail Shop Partners through our 
              comprehensive financing solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <TrendingUp size={24} className="text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Increased Sales</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Our financing options help Shop Partners increase their sales by making 
                expensive products more accessible to customers.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Users size={24} className="text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Wider Customer Base</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Reach customers who prefer EMI options and expand your market 
                reach with our flexible payment solutions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Award size={24} className="text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3">Guaranteed Payments</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Get guaranteed payments for approved transactions with our 
                secure payment processing system.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Become a Partner CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200">
            <CardContent className="p-6 sm:p-8 lg:p-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                Become Our Partner
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
                Join our growing network of retail Shop Partners and offer your customers 
                flexible financing options. Increase your sales and customer satisfaction.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/contact">
                    Partner With Us
                  </Link>
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/contact">
                    Learn More
                  </Link>
                </Button>
              </div>

              <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 text-center">
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">24/7</div>
                  <div className="text-xs sm:text-sm text-gray-600">Partner Support</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">48hrs</div>
                  <div className="text-xs sm:text-sm text-gray-600">Setup Time</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-bold text-blue-600 mb-1">0%</div>
                  <div className="text-xs sm:text-sm text-gray-600">Setup Cost</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Card>
            <CardContent className="p-6 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Ready to Shop with Easy EMIs?
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Browse products from our trusted Shop Partners and get instant financing 
                with competitive rates and flexible repayment options.
              </p>
              <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
                <Button className="bg-blue-600 hover:bg-blue-700" asChild>
                  <Link href="/signup">Apply for Loan</Link>
                </Button>
                <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50" asChild>
                  <Link href="/contact">Contact Us</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
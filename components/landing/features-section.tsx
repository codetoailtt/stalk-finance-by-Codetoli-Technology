'use client'

import { motion } from 'framer-motion'
import { FileText, Store, UserCheck, Bell, Shield, BarChart3 } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: FileText,
      title: 'Easy Application',
      description: 'Simple online application process with minimal documentation required for quick loan approval.'
    },
    {
      icon: Store,
      title: 'Wide Shop Network', // changed from 'Wide Network'
      description: 'Shop with thousands of retailers for mobile phones, furniture, and electronics across India.' // changed 'Partner' to 'Shop'
    },
    {
      icon: UserCheck,
      title: 'Quick Approvals',
      description: 'Advanced algorithms for instant credit assessment and loan approval within minutes.'
    },
    {
      icon: Shield,
      title: 'Secure & Safe',
      description: 'Bank-grade security for all transactions and personal data with complete privacy protection.'
    },
    {
      icon: Bell,
      title: 'Instant Updates',
      description: 'Real-time SMS and email notifications for application status, EMI reminders, and offers.'
    },
    {
      icon: BarChart3,
      title: 'Flexible Terms',
      description: 'Customizable loan terms with flexible repayment options to suit your financial needs.'
    }
  ]

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Easy Financing
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              From application to disbursement, we've got you covered with features designed 
              to make your financing experience smooth and hassle-free.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon size={28} className="text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Feature Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 lg:p-12 shadow-sm border"
        >
          <div className="grid lg:grid-cols-3 gap-8 items-center">
            <div className="lg:col-span-2">
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Product Categories We Offer
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                We specialize in consumer financing across multiple categories. Whether you're 
                looking for the latest smartphone or upgrading your home furniture, we have 
                tailored loan solutions for every need.
              </p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                  <h4 className="font-semibold text-blue-800 mb-2">Mobile Phones</h4>
                  <p className="text-sm text-blue-600">Latest smartphones, tablets, and accessories with easy EMIs</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                  <h4 className="font-semibold text-green-800 mb-2">Furniture</h4>
                  <p className="text-sm text-green-600">Home and office furniture with flexible payment options</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
                  <h4 className="font-semibold text-orange-800 mb-2">Electronics</h4>
                  <p className="text-sm text-orange-600">Laptops, TVs, appliances and more with instant approval</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-gray-50 rounded-xl p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">📱</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Mobile Loans</div>
                      <div className="text-xs text-muted-foreground">Up to ₹1,50,000</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-green-600">🪑</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Furniture Loans</div>
                      <div className="text-xs text-muted-foreground">Up to ₹5,00,000</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3 p-3 bg-white rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-orange-600">💻</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Electronics</div>
                      <div className="text-xs text-muted-foreground">Up to ₹3,00,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
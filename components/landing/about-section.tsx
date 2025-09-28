'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Users, Award } from 'lucide-react'

export function AboutSection() {
  const benefits = [
    {
      icon: Shield,
      title: 'Secure & Compliant',
      description: 'Bank-level security with full regulatory compliance to protect your personal and financial information.'
    },
    {
      icon: Zap,
      title: 'Quick Approvals',
      description: 'Get loan approvals in minutes, not days. Our automated system processes applications instantly.'
    },
    {
      icon: Users,
      title: 'Customer First',
      description: 'Dedicated customer support and personalized service to help you every step of the way.'
    },
    {
      icon: Award,
      title: 'Trusted Partner',
      description: '500+ satisfied customers trust us for their financing needs with excellent service ratings.'
    }
  ]

  return (
    <section id="about" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose Stalk Finance?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              We're dedicated to making finance accessible to everyone. Whether you need a new 
              mobile phone or want to upgrade your furniture, we provide quick, hassle-free 
              loans with competitive rates and flexible terms.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <benefit.icon size={32} className="text-blue-600" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {benefit.title}
              </h3>
              
              <p className="text-muted-foreground leading-relaxed">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-gray-50 rounded-2xl p-8 lg:p-12"
        >
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-2xl lg:text-3xl font-bold text-foreground mb-4">
                Financing Made Simple
              </h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                From mobile phones to home furniture, we make it easy to get the financing 
                you need. Our streamlined process means you can focus on what matters most - 
                enjoying your new purchase while we handle the rest.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-foreground">Approval in under 10 minutes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-foreground">Minimal documentation required</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  <span className="text-foreground">Flexible repayment options</span>
                </div>
              </div>
            </div>
            
     
          </div>
        </motion.div>
      </div>
    </section>
  )
}
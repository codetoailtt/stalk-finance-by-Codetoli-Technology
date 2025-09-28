'use client'

import { motion } from 'framer-motion'
import { FileText, Store, Eye, CheckCircle, Upload } from 'lucide-react'

export function WorkflowSection() {
  const steps = [
    {
      icon: FileText,
      title: 'Apply Online',
      description: 'Fill out our simple online application with basic details'
    },
    {
      icon: Store,
      title: 'Choose Product',
      description: 'Select your desired product from our partner network'
    },
    {
      icon: Eye,
      title: 'Instant Review',
      description: 'Our system instantly reviews your application and credit profile'
    },
    {
      icon: CheckCircle,
      title: 'Quick Approval',
      description: 'Get loan approval within minutes with competitive rates'
    },
    {
      icon: Upload,
      title: 'Get Your Product',
      description: 'Collect your product and start your easy EMI journey'
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Simple, Quick Process
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Get your loan approved and product delivered in just a few simple steps. 
              Our streamlined process makes financing effortless.
            </p>
          </motion.div>
        </div>

        {/* Desktop Workflow */}
        <div className="hidden lg:block">
          <div className="relative">
            {/* Connection Line */}
            <div className="absolute top-16 left-0 right-0 h-0.5 bg-blue-600"></div>
            
            <div className="grid grid-cols-5 gap-8">
              {steps.map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  className="text-center relative"
                >
                  {/* Step Circle */}
                  <div className="w-16 h-16 bg-white border-4 border-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg relative z-10">
                    <step.icon size={24} className="text-blue-600" />
                  </div>
                  
                  {/* Step Number */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-20">
                    {index + 1}
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Workflow */}
        <div className="lg:hidden space-y-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="flex items-start space-x-4"
            >
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <step.icon size={20} className="text-blue-600" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                  {index + 1}
                </div>
                
                {/* Connection line for mobile */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 top-12 w-0.5 h-8 bg-blue-300"></div>
                )}
              </div>
              
              <div className="flex-1 pt-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Workflow Benefits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
          className="mt-16 bg-gray-50 rounded-2xl p-8 lg:p-12"
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-foreground mb-3">
              Why Choose Our Process?
            </h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our streamlined process is designed to get you the financing you need quickly 
              and efficiently, with minimal hassle and maximum convenience.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">10 Min</div>
              <div className="text-sm text-muted-foreground">Approval Time</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">95%</div>
              <div className="text-sm text-muted-foreground">Approval Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-sm text-muted-foreground">Customer Support</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
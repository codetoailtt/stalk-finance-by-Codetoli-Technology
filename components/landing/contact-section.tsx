'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'
import Link from 'next/link'

export function ContactSection() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Get in Touch
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Ready to get the financing you need? Contact us today to check your 
              eligibility or to discuss your loan requirements with our experts.
            </p>
          </motion.div>
        </div>

        {/* Contact Information - full width */}
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="space-y-8 max-w-2xl mx-auto"
        >
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-6 text-center">
              Reach Out to Us
            </h3>
            <p className="text-muted-foreground leading-relaxed mb-8 text-center">
              We're here to help you get the financing you need. Reach out through 
              any of these channels and we'll get back to you within 2 hours.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Email</h4>
                <p className="text-muted-foreground">stalkfinancepvtltd@gmail.com</p>
                <p className="text-sm text-muted-foreground">We'll respond within 2 hours</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Phone</h4>
                <p className="text-muted-foreground">+91 80107 79828</p>
                <p className="text-sm text-muted-foreground">Mon-Sat, 9AM-8PM IST</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Office</h4>
                <p className="text-muted-foreground">Stalk Finance Private Limited<br />H. No-488 Lakhandur Road, Kasturba Ward, Desaiganj, Desaiganj, Gadchiroli- 441207, Maharashtra</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Clock size={20} className="text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1">Business Hours</h4>
                <p className="text-muted-foreground">
                  Monday - Saturday: 9:00 AM - 8:00 PM<br />
                  Sunday: Closed
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 mt-8 text-center">
            <h4 className="font-semibold text-foreground mb-3">
              Need Quick Financing?
            </h4>
            <p className="text-muted-foreground text-sm mb-4">
              Join thousands of satisfied customers who have chosen Stalk Finance 
              for their financing needs.
            </p>
            <div className="flex justify-center space-x-3">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/signup" className="w-full h-full block px-4 py-2">Apply Now</Link>
              </Button>
              <Button variant="outline" size="sm" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                <Link href="/contact" className="w-full h-full block px-4 py-2">Contact Us</Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'

const testimonials = [
	{
		name: 'Sarah Chen',
		title: 'CFO, TechStart Inc.',
		content:
			'Stalk Finance transformed our enquiry processing from weeks to hours. The automated workflows and real-time tracking have made our operations incredibly efficient.',
		rating: 5,
		image:
			'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
	},
	{
		name: 'Michael Rodriguez',
		title: 'Operations Manager, GrowthCorp',
		content:
			'The store verification system is brilliant. We can now onboard new vendors quickly while maintaining our security standards. Highly recommended!',
		rating: 5,
		image:
			'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
	},
	{
		name: 'Emily Johnson',
		title: 'Finance Director, RetailPlus',
		content:
			'Outstanding platform! The document handling is secure and the approval workflows are intuitive. Our team productivity has increased by 60%.',
		rating: 5,
		image:
			'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2',
	},
]

export function TestimonialsSection() {
	const [currentIndex, setCurrentIndex] = useState(0)

	const nextTestimonial = () => {
		setCurrentIndex((prev) => (prev + 1) % testimonials.length)
	}

	const prevTestimonial = () => {
		setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
	}

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
							Trusted by Finance Teams Everywhere
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							See what our customers say about their experience with our platform. Join hundreds of satisfied
							businesses streamlining their operations.
						</p>
					</motion.div>
				</div>

				<div className="relative max-w-4xl mx-auto">
					<AnimatePresence mode="wait">
						<motion.div
							key={currentIndex}
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.5 }}
							className="bg-gray-50 rounded-2xl p-8 lg:p-12"
						>
							<div className="flex items-center mb-6">
								{[...Array(testimonials[currentIndex].rating)].map((_, i) => (
									<Star key={i} size={20} className="text-yellow-400 fill-current" />
								))}
							</div>

							<blockquote className="text-xl lg:text-2xl text-foreground leading-relaxed mb-8 font-medium">
								"{testimonials[currentIndex].content}"
							</blockquote>

							<div className="flex items-center space-x-4">
								<div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
									<img
										src={testimonials[currentIndex].image}
										alt={testimonials[currentIndex].name}
										className="w-full h-full object-cover"
									/>
								</div>
								<div>
									<div className="font-semibold text-foreground text-lg">
										{testimonials[currentIndex].name}
									</div>
									<div className="text-muted-foreground">
										{testimonials[currentIndex].title}
									</div>
								</div>
							</div>
						</motion.div>
					</AnimatePresence>

					{/* Navigation */}
					<div className="flex items-center justify-between mt-8">
						<button
							onClick={prevTestimonial}
							className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
						>
							<ChevronLeft size={20} className="text-gray-600" />
						</button>

						<div className="flex space-x-2">
							{testimonials.map((_, index) => (
								<button
									key={index}
									onClick={() => setCurrentIndex(index)}
									className={`w-3 h-3 rounded-full transition-colors ${
										index === currentIndex ? 'bg-primary' : 'bg-gray-300'
									}`}
								/>
							))}
						</div>

						<button
							onClick={nextTestimonial}
							className="w-12 h-12 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
						>
							<ChevronRight size={20} className="text-gray-600" />
						</button>
					</div>
				</div>

				{/* Stats */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.4 }}
					viewport={{ once: true }}
					className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center"
				>
					<div>
						<div className="text-3xl lg:text-4xl font-bold text-primary mb-2">100+</div>
						<div className="text-muted-foreground">Customers Served</div>
					</div>
					<div>
						<div className="text-3xl lg:text-4xl font-bold text-primary mb-2">99.9%</div>
						<div className="text-muted-foreground">Uptime</div>
					</div>
					<div>
						<div className="text-3xl lg:text-4xl font-bold text-primary mb-2">200+</div>
						<div className="text-muted-foreground">Enquiries Processed</div>
					</div>
					<div>
						<div className="text-3xl lg:text-4xl font-bold text-primary mb-2">24/7</div>
						<div className="text-muted-foreground">Support</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
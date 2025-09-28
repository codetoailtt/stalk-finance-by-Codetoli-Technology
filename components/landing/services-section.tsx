'use client'

import { motion } from 'framer-motion'

// This would typically fetch from API, but for landing page we'll use static data
const products = [
	{
		name: 'Mobile Phone Loans',
		description: 'Get the latest smartphones with easy EMI options',
		
	},
	{
		name: 'Furniture Financing',
		description: 'Transform your home with flexible furniture loans',
		
	},
	{
		name: 'Electronics Loans',
		description: 'Laptops, TVs, and appliances with instant approval',
		
	},
	{
		name: 'Home Appliances',
		description: 'Kitchen appliances and home essentials financing',
		
	},
	{
		name: 'Personal Gadgets',
		description: 'Tablets, smartwatches, and tech accessories',
		
	},
]
import { IndianRupee } from 'lucide-react'

export function ServicesSection() {
	return (
		<section id="services" className="py-20 bg-gray-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Product Categories
						</h2>
						<p className="text-xl text-muted-foreground max-w-3xl mx-auto">
							Quick and easy financing solutions for all your needs. From the
							latest gadgets to home essentials, we've got flexible loan options
							with competitive rates.
						</p>
					</motion.div>
				</div>

				<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
					{products.map((product, index) => (
						<motion.div
							key={product.name}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.1 }}
							viewport={{ once: true }}
							className="bg-white rounded-2xl p-8 shadow-sm border hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
						>
							<div className="mb-6">
								<div className="flex items-start justify-between mb-3">
									<h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
										{product.name}
									</h3>
									
								</div>

								<p className="text-muted-foreground leading-relaxed">
									{product.description}
								</p>
							</div>
						</motion.div>
					))}
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					viewport={{ once: true }}
					className="mt-16 text-center"
				>
					<div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border">
						<h3 className="text-2xl font-bold text-foreground mb-4">
							Need a Custom Loan Amount?
						</h3>
						<p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
							We offer customized loan solutions to meet your specific financial
							needs. Contact our team to discuss your requirements and get a
							personalized offer.
						</p>

						<div className="flex justify-center">
							<a href="/signup">
								<button className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
									Submit Enquiry
								</button>
							</a>
						</div>
					</div>
				</motion.div>
			</div>
		</section>
	)
}
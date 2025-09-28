'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus } from 'lucide-react'

const faqs = [
	{
		question: 'What documents do I need to apply for a loan?',
		answer: 'You need basic documents like Aadhaar card, PAN card, salary slips (for salaried) or income proof (for self-employed), and bank statements. Our minimal documentation process makes it easy to apply.',
	},
	{
		question: 'How quickly can I get loan approval?',
		answer: 'Our advanced algorithm provides instant loan approval within 10 minutes for most applications. Once approved, you can collect your product immediately from our partner stores.',
	},
	{
		question: 'What are the interest rates and charges?',
		answer: 'Our interest rates start from 12% to 18% per annum and vary based on your credit profile and loan amount. We have transparent pricing with no hidden charges - only processing fee and GST as applicable.',
	},
	{
		question: 'Can I prepay my loan without penalties?',
		answer: 'Yes! You can prepay your loan anytime without any prepayment penalties. We believe in giving you complete flexibility to manage your finances the way you want.',
	},
	{
		question: 'What is the maximum loan amount I can get?',
		answer: 'Loan amounts vary by category - up to ₹1.5 lakhs for mobile phones, ₹5 lakhs for furniture, and ₹3 lakhs for electronics. The final amount depends on your eligibility and credit profile.',
	},
	{
		question: 'Do you check CIBIL score for loan approval?',
		answer: 'Yes, we check your CIBIL score as part of our assessment. However, we also consider other factors, so even if your score is not perfect, you may still be eligible for a loan.',
	},
	{
		question: 'Can I change my EMI date?',
		answer: 'Yes, you can request to change your EMI date once after loan disbursal. Contact our customer support team, and we\'ll help you choose a date that suits your salary cycle.',
	},
	{
		question: 'What happens if I miss an EMI payment?',
		answer: 'We understand that sometimes payments can be delayed. We offer a grace period and will send you reminders. However, consistent delays may affect your credit score and incur late payment charges.',
	},
]

export function FAQSection() {
	const [openIndex, setOpenIndex] = useState<number | null>(null)

	const toggleFAQ = (index: number) => {
		setOpenIndex(openIndex === index ? null : index)
	}

	return (
		<section id="faq" className="py-20 bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-16">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Find answers to common questions about our loans, processes, and
							services.
						</p>
					</motion.div>
				</div>

				<div className="space-y-4">
					{faqs.map((faq, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: index * 0.05 }}
							viewport={{ once: true }}
							className="bg-white rounded-2xl shadow-sm border overflow-hidden"
						>
							<button
								onClick={() => toggleFAQ(index)}
								className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
							>
								<h3 className="text-lg font-semibold text-foreground pr-4">
									{faq.question}
								</h3>
								<div className="flex-shrink-0">
									{openIndex === index ? (
										<Minus size={20} className="text-blue-600" />
									) : (
										<Plus size={20} className="text-muted-foreground" />
									)}
								</div>
							</button>

							<motion.div
								initial={false}
								animate={{
									height: openIndex === index ? 'auto' : 0,
									opacity: openIndex === index ? 1 : 0,
								}}
								transition={{ duration: 0.3 }}
								className="overflow-hidden"
							>
								<div className="px-6 pb-6">
									<p className="text-muted-foreground leading-relaxed">
										{faq.answer}
									</p>
								</div>
							</motion.div>
						</motion.div>
					))}
				</div>

		
			</div>
		</section>
	)
}
import jsPDF from 'jspdf'

// PDF generation utility using jsPDF
export async function generateUserTermsAcceptancePDF(queryData: any) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('STALK FINANCE', 20, 20)
  doc.text('TERMS ACCEPTANCE CONFIRMATION', 20, 30)

  // Enquiry details
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Enquiry Reference: ${queryData.reference_id}`, 20, 50)
  doc.text(`User: ${queryData.user?.full_name || queryData.user?.email}`, 20, 60)
  doc.text(`Service: ${queryData.service?.name}`, 20, 70)
  doc.text(`Terms Accepted At: ${new Date(queryData.terms_accepted_at).toLocaleString()}`, 20, 80)

  // Confirmation text (add line break for long text)
  doc.setFontSize(10)
  const confirmationText1 = `This document confirms that the above user has accepted the`
  const confirmationText2 = `Stalk Finance Private Limited Terms and Conditions on ${new Date(queryData.terms_accepted_at).toLocaleDateString()} at ${new Date(queryData.terms_accepted_at).toLocaleTimeString()}.`
  doc.text(confirmationText1, 20, 100)
  doc.text(confirmationText2, 20, 106)

  let yPos = 116 // move terms up a bit

  // Reduce font size for terms to fit more content on the page
  doc.setFontSize(9)
  const termsLines = doc.splitTextToSize(
    `A) I/We do hereby certify that the information provided by me/us in this application form is true and correct in all respects and The Stalk Finance Private Limited is entitled to verify this directly or through any third party agent.
B) I/We further acknowledge the Stalk Finance Private Limited right to seek any information from any other source in this regard.
C) I/We do understand that all the above mentioned information will form the basis of any facility that the Stalk Finance Private Limited may decide to grant me/us at its sole discretion.
D) I/We do further agree that any facility that may be provided to me/us shall be governed by the rules of the Stalk Finance Private Limited that may be in force from time to time.
E) I/We will be bound by the terms and conditions of the facility that may be granted to me/us.
F) I/We do authorise the Stalk Finance Private Limited to debit my/our any other account with the Bank for any fees, charges, interest, and default of my repayment by using my pledged singed blank cheque.
G) I/We undertake to intimate the Stalk Finance Private Limited in the event of any change in my/our mobile phone number.
H) I/We hereby declare that I/we shall notify the Stalk Finance Private Limited, in writing or on phone, of any changes in my/our employment and/or residential address and telephone numbers.
I) Applicant must provided 6 singed blank check with one minimum guarantor.
J) Preliminary charges of Finance will be paid First.
K) Default in payment fo of 2 instalment will be recovered with fine & charges and the guarantor will liable for the same.
L) In Case of Cheque Bounce penalty of Rs. 5000 +GST will be penalize & duely Received From Applicant.
M) Product will Not Be sale Until the Total Finance Amuont Will Be Paid.
N) The Above arrangement is in the nature of hire purchase and mere payment of down payment does not make the buyer owner of said goods. The ownership in goods will be transferred only after the payment of last installment. Stalk Finance Private Limited will have complete rights to forfeit the goods in case non payment of principal as well as interest amount.
O) In any case of default or non repayment of more than 2 EMI, then the borrower as well as his guarantors will be liable to pay the same and all the payment for recovery including legal, court stamp duty and Advocacy fees will be recovered separately.

Hence,
I Undertake to Provide any further information as Stalk Finance Private Limited may ask from time to time. I hear by declare that all the information provide by me is true and corrrect and I accept all the terms ...`,
    165
  )
  doc.setFont('helvetica', 'normal')
  doc.text(termsLines, 20, yPos)
  yPos += termsLines.length * 5 // reduce line height for less space

  // Add a separator line for clarity
  doc.setDrawColor(200, 200, 200)
  doc.line(20, yPos, 190, yPos)
  yPos += 5 // reduce space after line

  // Footer: reduce font size and spacing to ensure visibility
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('This acceptance is legally binding and was recorded in our secure system.', 20, yPos)
  yPos += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Finance Platform', 20, yPos)
  yPos += 4.5
  doc.text(`© ${new Date().getFullYear()} All rights reserved.`, 20, yPos)
  yPos += 4.5
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, yPos)

  doc.save(`Terms_Acceptance_${queryData.reference_id}_${new Date().toISOString().split('T')[0]}.pdf`)
}
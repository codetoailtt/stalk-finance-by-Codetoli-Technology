import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// EMI calculation utilities
export function calculateMonthlyEMI(principal: number, annualRate: number, tenureMonths: number = 12): number {
  // Simple interest calculation: SI = P * R * T / 100
  const totalInterest = (principal * annualRate * tenureMonths) / (100 * 12);
  const totalAmount = principal + totalInterest;
  const emiAmount = totalAmount / tenureMonths;
  
  return Math.round(emiAmount * 100) / 100; // Round to 2 decimal places
}

export function calculateDailyPenalty(emiAmount: number, daysOverdue: number): number {
  const dailyPenaltyRate = 0.02; // 2% per day
  let totalPenalty = 0;
  
  for (let day = 1; day <= daysOverdue; day++) {
    totalPenalty += emiAmount * dailyPenaltyRate;
  }
  
  return Math.round(totalPenalty * 100) / 100;
}

export function getDaysOverdue(emiDate: number): number {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentDay = now.getDate();
  
  // Create EMI due date for current month
  const emiDueDate = new Date(currentYear, currentMonth, emiDate);
  
  // If current day is before EMI date, not overdue
  if (currentDay <= emiDate) {
    return 0;
  }
  
  // Calculate days overdue
  const timeDiff = now.getTime() - emiDueDate.getTime();
  const daysOverdue = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, daysOverdue);
}

export function getPenaltyStartDate(emiDate: number): Date {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  // EMI due date for this month
  const emiDueDate = new Date(currentYear, currentMonth, emiDate);
  // Grace period ends 3 days after due date
  return new Date(emiDueDate.getTime() + 3 * 24 * 60 * 60 * 1000);
}

export function isInPenaltyGracePeriod(emiDate: number): boolean {
  const now = new Date();
  const penaltyStart = getPenaltyStartDate(emiDate);
  return now > new Date(now.getFullYear(), now.getMonth(), emiDate) && now <= penaltyStart;
}

export function getDaysOverdueWithGrace(emiDate: number): number {
  const now = new Date();
  const penaltyStart = getPenaltyStartDate(emiDate);
  if (now <= penaltyStart) return 0;
  const timeDiff = now.getTime() - penaltyStart.getTime();
  return Math.floor(timeDiff / (1000 * 60 * 60 * 24));
}

export function getTotalAmountDue(emiAmount: number, penaltyAmount: number): {
  emiAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  hasPenalty: boolean;
} {
  return {
    emiAmount,
    penaltyAmount,
    totalAmount: emiAmount + penaltyAmount,
    hasPenalty: penaltyAmount > 0
  };
}

export function getCurrentMonthKey(emiDate: number): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(emiDate).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

export function isEMIDueThisMonth(emiDate: number, emiPayments: any): boolean {
  const currentMonthKey = getCurrentMonthKey(emiDate);
  return !emiPayments || !emiPayments[currentMonthKey];
}

export function isEMIComplete(query: any): boolean {
  // If query is completed, consider EMI as complete
  if (query.status === 'completed') {
    return true;
  }
  
  // If EMI hasn't started, it's not complete
  if (!query.emi_started || !query.principal_amount || !query.emi_percent || !query.tenure_months) {
    return false;
  }
  
  // Calculate expected total amount
  const monthlyEMI = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months);
  const expectedTotalAmount = monthlyEMI * query.tenure_months;
  
  // Calculate total paid amount from emi_payments
  const totalPaidAmount = query.emi_payments ? 
    Object.values(query.emi_payments).reduce((sum: number, payment: any) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0) : 0;
  
  // Consider complete if total paid is >= 95% of expected (allowing for small rounding differences)
  return totalPaidAmount >= (expectedTotalAmount * 0.99);
}

export function getEMICompletionStatus(query: any): {
  isComplete: boolean;
  totalPaid: number;
  totalExpected: number;
  remainingAmount: number;
  completionPercentage: number;
} {
  const isComplete = isEMIComplete(query);
  
  if (!query.emi_started || !query.principal_amount || !query.emi_percent || !query.tenure_months) {
    return {
      isComplete: false,
      totalPaid: 0,
      totalExpected: 0,
      remainingAmount: 0,
      completionPercentage: 0
    };
  }
  
  const monthlyEMI = calculateMonthlyEMI(query.principal_amount, query.emi_percent, query.tenure_months);
  const totalExpected = monthlyEMI * query.tenure_months;
  
  const totalPaid = query.emi_payments ? 
    Object.values(query.emi_payments).reduce((sum: number, payment: any) => {
      return sum + (parseFloat(payment.amount) || 0);
    }, 0) : 0;
  
  const remainingAmount = Math.max(0, totalExpected - totalPaid);
  const completionPercentage = totalExpected > 0 ? Math.min(100, (totalPaid / totalExpected) * 100) : 0;
  
  return {
    isComplete,
    totalPaid,
    totalExpected,
    remainingAmount,
    completionPercentage
  };
}

export function getServiceFeeWithGST(baseFee: number = 500): { baseFee: number; gst: number; total: number } {
  const gst = Math.round(baseFee * 0.18 * 100) / 100;
  const total = baseFee + gst;
  
  return { baseFee, gst, total };
}

export function generateUPIPaymentURL(upiId: string, amount: number, note: string): string {
  const params = new URLSearchParams({
    pa: upiId,
    am: amount.toString(),
    tn: note,
    cu: 'INR'
  });
  
  return `upi://pay?${params.toString()}`;
}

export function shouldEMIBeStarted(emiStartedAt: string | Date | undefined): boolean {
  if (!emiStartedAt) return false
  const now = new Date()
  const emiStart = new Date(emiStartedAt)
  return (
    now.getFullYear() > emiStart.getFullYear() ||
    (now.getFullYear() === emiStart.getFullYear() && now.getMonth() > emiStart.getMonth()) ||
    (now.getFullYear() === emiStart.getFullYear() && now.getMonth() === emiStart.getMonth() && now.getDate() >= emiStart.getDate())
  )
}

export function getNextMonthEMIStartDate(emiDate: number): Date {
  const now = new Date()
  // Get next month's date
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, emiDate)
  return nextMonth
}
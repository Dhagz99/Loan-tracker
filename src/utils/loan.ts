import { getLoanBillsByGroup } from "@/src/database/bills.repository";
import { Bill } from "@/src/types/bill";

export function getLoanRemainingBalance(bill: Bill) {
  if (!bill.loanGroupId || !bill.totalLoanAmount) {
    return null;
  }

  const loanBills = getLoanBillsByGroup(bill.loanGroupId);

  const paidAmount = loanBills
    .filter((item) => item.status === "paid")
    .reduce((sum, item) => sum + Number(item.amount), 0);

  const remainingBalance = Number(bill.totalLoanAmount) - paidAmount;

  return {
    totalLoanAmount: Number(bill.totalLoanAmount),
    paidAmount,
    remainingBalance,
    totalTerms: bill.totalTerms ?? loanBills.length,
    paidTerms: loanBills.filter((item) => item.status === "paid").length,
  };
}
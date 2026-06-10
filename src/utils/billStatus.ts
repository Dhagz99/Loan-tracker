import { Bill, BillDisplayStatus } from "@/src/types/bill";

export function getBillDisplayStatus(bill: Bill): BillDisplayStatus {
  if (bill.status === "paid") {
    return "paid";
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(bill.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return "overdue";
  }

  return "unpaid";
}
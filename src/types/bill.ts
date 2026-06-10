export type BillStatus = "unpaid" | "paid";

export type BillDisplayStatus = "paid" | "unpaid" | "overdue";

export type Bill = {
  id: number;
  title: string;
  category: string;
  amount: number;
  dueDate: string;
  status: BillStatus;
  notes?: string | null;
  createdAt: string;
};
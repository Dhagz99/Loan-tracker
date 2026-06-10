import { z } from "zod";

export const billSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export const installmentBillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  totalAmount: z.coerce.number().positive("Total amount must be greater than 0"),
  terms: z.coerce.number().int().positive("Terms must be greater than 0"),
  firstDueDate: z.string().min(1, "First due date is required"),
  notes: z.string().optional(),
});

export type BillFormInput = z.input<typeof billSchema>;
export type BillSchema = z.output<typeof billSchema>;

export type InstallmentBillFormInput = z.input<typeof installmentBillSchema>;
export type InstallmentBillSchema = z.output<typeof installmentBillSchema>;
import { z } from "zod";

export const billSchema = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
});

export type BillFormInput = z.input<typeof billSchema>;
export type BillSchema = z.output<typeof billSchema>;
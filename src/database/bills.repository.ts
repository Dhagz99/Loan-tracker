import { db } from "./db";
import { Bill } from "../types/bill";
import { BillSchema } from "../schemas/bill.schema";

export function getBills(): Bill[] {
  return db.getAllSync<Bill>(`
    SELECT * FROM bills
    ORDER BY dueDate ASC
  `);
}

export function getCurrentMonthBills(): Bill[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  return db.getAllSync<Bill>(
    `
    SELECT * FROM bills
    WHERE dueDate LIKE ?
    ORDER BY dueDate ASC
    `,
    [`${year}-${month}%`]
  );
}

export function createBill(data: BillSchema) {
  db.runSync(
    `
    INSERT INTO bills 
    (title, category, amount, dueDate, status, notes)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      data.title,
      data.category,
      Number(data.amount),
      data.dueDate,
      "unpaid",
      data.notes ?? null,
    ]
  );
}

export function createInstallmentBills(data: {
  title: string;
  category: string;
  totalAmount: number;
  terms: number;
  firstDueDate: string;
  notes?: string;
}) {
  const monthlyAmount = data.totalAmount / data.terms;
  const firstDate = new Date(data.firstDueDate);

  for (let i = 0; i < data.terms; i++) {
    const dueDate = new Date(firstDate);
    dueDate.setMonth(firstDate.getMonth() + i);

    const formattedDueDate = dueDate.toISOString().split("T")[0];

    db.runSync(
      `
      INSERT INTO bills 
      (title, category, amount, dueDate, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        `${data.title} - ${i + 1}/${data.terms}`,
        data.category,
        monthlyAmount,
        formattedDueDate,
        "unpaid",
        data.notes ?? null,
      ]
    );
  }
}

export function updateBillStatus(id: number, status: "paid" | "unpaid") {
  db.runSync(
    `
    UPDATE bills
    SET status = ?
    WHERE id = ?
    `,
    [status, id]
  );
}

export function deleteBill(id: number) {
  db.runSync(
    `
    DELETE FROM bills
    WHERE id = ?
    `,
    [id]
  );
}
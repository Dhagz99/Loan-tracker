import { db } from "./db";
import { Bill } from "../types/bill";
import { BillSchema } from "../schemas/bill.schema";

export function getBills(): Bill[] {
  return db.getAllSync<Bill>(`
    SELECT * FROM bills
    ORDER BY dueDate ASC
  `);
}

export function getBillsByMonth(year: number, month: number): Bill[] {
  const formattedMonth = String(month).padStart(2, "0");

  return db.getAllSync<Bill>(
    `
    SELECT * FROM bills
    WHERE dueDate LIKE ?
    ORDER BY dueDate ASC
    `,
    [`${year}-${formattedMonth}%`]
  );
}

export function getCurrentMonthBills(): Bill[] {
  const now = new Date();

  return getBillsByMonth(now.getFullYear(), now.getMonth() + 1);
}

export function getLoanBillsByGroup(loanGroupId: string): Bill[] {
  return db.getAllSync<Bill>(
    `
    SELECT * FROM bills
    WHERE loanGroupId = ?
    ORDER BY dueDate ASC
    `,
    [loanGroupId]
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
  const loanGroupId = `${data.title}-${Date.now()}`;

  for (let i = 0; i < data.terms; i++) {
    const dueDate = new Date(firstDate);
    dueDate.setMonth(firstDate.getMonth() + i);

    const formattedDueDate = dueDate.toISOString().split("T")[0];

    db.runSync(
      `
      INSERT INTO bills 
      (
        title, 
        category, 
        amount, 
        dueDate, 
        status, 
        notes,
        loanGroupId,
        totalLoanAmount,
        termNo,
        totalTerms
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        `${data.title} - ${i + 1}/${data.terms}`,
        data.category,
        monthlyAmount,
        formattedDueDate,
        "unpaid",
        data.notes ?? null,
        loanGroupId,
        data.totalAmount,
        i + 1,
        data.terms,
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


export function getBillById(id: number): Bill | null {
    const result = db.getFirstSync<Bill>(
      `
      SELECT * FROM bills
      WHERE id = ?
      `,
      [id]
    );
  
    return result ?? null;
  }
  
  export function updateBill(
    id: number,
    data: {
      title: string;
      category: string;
      amount: number;
      dueDate: string;
      notes?: string;
    }
  ) {
    db.runSync(
      `
      UPDATE bills
      SET 
        title = ?,
        category = ?,
        amount = ?,
        dueDate = ?,
        notes = ?
      WHERE id = ?
      `,
      [
        data.title,
        data.category,
        Number(data.amount),
        data.dueDate,
        data.notes ?? null,
        id,
      ]
    );
  }
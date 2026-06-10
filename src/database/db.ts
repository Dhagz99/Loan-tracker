import * as SQLite from "expo-sqlite";

export const db = SQLite.openDatabaseSync("duetrack.db");

function addColumnIfNotExists(columnName: string, columnDefinition: string) {
  const columns = db.getAllSync<{ name: string }>(`PRAGMA table_info(bills);`);
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.execSync(`ALTER TABLE bills ADD COLUMN ${columnDefinition};`);
  }
}

export function initDatabase() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS bills (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      dueDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'unpaid',
      notes TEXT,
      createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  addColumnIfNotExists("loanGroupId", "loanGroupId TEXT");
  addColumnIfNotExists("totalLoanAmount", "totalLoanAmount REAL");
  addColumnIfNotExists("termNo", "termNo INTEGER");
  addColumnIfNotExists("totalTerms", "totalTerms INTEGER");
}
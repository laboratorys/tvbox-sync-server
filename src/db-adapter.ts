import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const dbPath = process.env.DATABASE_PATH || "tvbox-sync-server.db";
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
const db = new Database(dbPath);

const runMigrations = () => {
  const migrationsDir = path.join(process.cwd(), "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("Migrations directory not found, skipping.");
    return;
  }

  const files = fs
    .readdirSync(migrationsDir)
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, "utf8");

    try {
      db.exec(sql);
      console.log(`✅ Applied migration: ${file}`);
    } catch (err) {
      console.error(`❌ Failed to apply migration ${file}:`, err);
    }
  }
};

// 启动时自动执行
runMigrations();

export const d1Adapter = {
  prepare: (sql: string) => {
    const stmt = db.prepare(sql);

    const execute = {
      first: async <T>(...params: any[]): Promise<T | null> => {
        const row = params.length > 0 ? stmt.get(...params) : stmt.get();
        return (row as T) || null;
      },
      all: async <T>(...params: any[]): Promise<{ results: T[] }> => {
        const data = params.length > 0 ? stmt.all(...params) : stmt.all();
        return { results: data as T[] };
      },

      run: async (...params: any[]) => {
        const info = params.length > 0 ? stmt.run(...params) : stmt.run();
        return { meta: { lastRowId: info.lastInsertRowid } };
      },
    };

    return {
      ...execute,
      bind: (...params: any[]) => ({
        first: async () => execute.first(...params),
        all: async () => execute.all(...params),
        run: async () => execute.run(...params),
      }),
    };
  },

  batch: async (statements: any[]) => {
    return db.transaction(() => {
      return statements.map((s) => s.run());
    })();
  },
};

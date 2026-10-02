import { DatabaseSync } from "node:sqlite";

/** Minimal D1 stand-in over node:sqlite — same prepare/bind/run/all/first shape. */
export function fakeD1() {
  const db = new DatabaseSync(":memory:");
  return {
    prepare(sql: string) {
      let args: unknown[] = [];
      const stmt = {
        bind(...a: unknown[]) {
          args = a;
          return stmt;
        },
        async run() {
          db.prepare(sql).run(...(args as never[]));
          return { success: true };
        },
        async all() {
          return { results: db.prepare(sql).all(...(args as never[])) };
        },
        async first() {
          return db.prepare(sql).get(...(args as never[])) ?? null;
        },
      };
      return stmt;
    },
  };
}

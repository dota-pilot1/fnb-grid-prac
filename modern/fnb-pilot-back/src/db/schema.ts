import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const employees = sqliteTable('employees', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  position: text('position').notNull(),
});

export type Employee = typeof employees.$inferSelect;
export type NewEmployee = typeof employees.$inferInsert;

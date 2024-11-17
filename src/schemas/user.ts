import { pgTable, serial, timestamp, uniqueIndex, varchar, pgEnum, boolean } from 'drizzle-orm/pg-core';

// Define Enums
export const userTypeEnum = pgEnum('user_type', ['client', 'operation']); // Enum for user types

// Define Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey().notNull(),

  full_name: varchar('full_name').notNull(),
  email: varchar('email').notNull(),
  phone: varchar('phone'),
  password: varchar('password').notNull(),

  user_type: userTypeEnum('user_type').default('client').notNull(), // Use enum for user type
  email_verified: boolean('email_verified').default(false),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
}, (table) => {
  return {
    emailIdx: uniqueIndex('email_idx').on(table.email),
  };
});

// TypeScript types for the table
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type UserTable = typeof users;

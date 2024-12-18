import { index, integer, json, pgEnum, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core';
import { users } from './user';

//export const fileTypeEnum = pgEnum('type', ['image', 'media', 'document', 'other']);

export const fileTypeEnum = pgEnum('type', ['document', 'image', 'media', 'other']);

export const statusEnum = pgEnum('status', ['active', 'archived']);

export const files = pgTable('files', {
  id: serial('id').primaryKey().notNull(),

  title:varchar('title').notNull(),
  name: varchar('name').notNull(),
  mime_type: varchar('mime_type').notNull(),
  size: integer('size').notNull(),
  path: varchar('path').notNull(), 

  uploaded_at: timestamp('uploaded_at').defaultNow(), 
  uploaded_by: integer('uploaded_by').references(() => users.id), 

  status: statusEnum('status').default('active'),
  
  type: fileTypeEnum('type').notNull(),
  tags: json('tags').$type<string[]>().default([]),
  
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  
},(table) => {
  return {
    typeIdx: index('type_idx').on(table.type),
  };
});


export type File = typeof files.$inferSelect;
export type NewFile = typeof files.$inferInsert;
export type FileTable = typeof files
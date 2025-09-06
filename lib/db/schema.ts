import { pgTable, boolean, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// import { useServerInsertedHTML } from "next/navigation";
// import { timeStamp } from "console";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),
  //basic file, folder information
  name: text("name").notNull(),
  path: text("path").notNull(), // document/project/resume
  size: integer("size").notNull(),
  type: text("type").notNull(), // Folder

  //storage informtion
  fileUrl: text("file_url").notNull(), // url to access the file
  thumbnailUrl: text("thumbnail_url"),

  // OwnerShip
    userId: text("user_id").notNull(),
    parentId: uuid("parent_id"), //parent folder id (null for root items)

  // file/folder tags (bookmark and foder are all boolean value true and false)
  isFolder: boolean("is_folder").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  isTrash: boolean("is_trash").default(false).notNull(),

  //TimeStamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),

  
});
/*
parent: Each file/folder can have one parent folder
children: each folder can have many child files/folder

*/
export const fileRelations = relations(files, ({one,many}) =>({
    parent: one(files, {
        fields: [files.parentId],
        references: [files.id] // self reference
    }),
    // relationship to child file/folder
    children: many(files) // many files inside folder
}))

// Type definations
export const File = typeof files.$inferSelect
export const NewFile = typeof files.$inferInsert

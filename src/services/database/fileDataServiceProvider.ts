import { db } from '../../lib/db';
import file from '../../routes/file';
import { files } from '../../schemas/file';
import { InferInsertModel, sql, eq, inArray, and } from 'drizzle-orm';
import { addSingleRecord, getRecordByColumn } from '../../dbClient/dbClient'; // Import necessary functions
import { File } from '../../schemas/file';

type NewFile = InferInsertModel<typeof files>;

class FileService {
    async createFile(fileData: any): Promise<any> {
        const result = await addSingleRecord(files, fileData);
        return result;
    }

    async checkTitleExists(title: string): Promise<boolean> {
        const existingFile = await db
            .select()
            .from(files)
            .where(eq(files.title, title))
            .limit(1);

        return existingFile.length > 0;
    }

    public async findAll({ offset, limit, filters, sort }: { offset: number; limit: number; filters?: string; sort?: string }) {
        const query = db.select().from(files);
        if (filters) {
            query.where(sql`${sql.raw(filters)}`);
        }
        if (sort) {
            query.orderBy(sql`${sql.raw(sort)}`);
        }
        query.limit(limit).offset(offset);
        const data = await query.execute();
        return data;
    }

    public async getCount(filters?: string) {
        const query = db.select({ count: sql<number>`COUNT(*)` }).from(files);
        if (filters) {
            query.where(sql`${sql.raw(filters)}`);
        }
        const data = await query.execute();
        return data[0].count;
    }

    public async findFileById(fileId: number) {
        const fileData = await db
            .select()
            .from(files)
            .where(eq(files.id, fileId));

        return fileData[0];
    }

    public async findSingleFile(file_id: number) {
        const fileData = await getRecordByColumn<File>(files, 'id', file_id);
        return fileData;
    }
    
    public async getFileByFileName(file_name: string) {
        // Query the database to find the file by its name (file_name)
        const fileData = await getRecordByColumn<File>(files, 'name', file_name);
        
        // Return the file data if found, otherwise null
        return fileData;
    }
    public async updateFileById(fileId: number, updatedData: { title: string }) {
        const file = await db
            .update(files)
            .set({ title: updatedData.title })
            .where(eq(files.id, fileId))
            .returning();
        return file[0];
    }

    public async deleteFileById(fileId: number) {
        const fileData = await db.update(files)
            .set({ status: 'archived' })
            .where(eq(files.id, fileId))
            .returning();

        return fileData[0];
    }

    public async deleteFilesByIds(ids: number[]) {
        const fileData = await db.update(files)
            .set({ status: 'archived' })
            .where(inArray(files.id, ids))
            .returning();

        return fileData;
    }

    async getTotalStorage(filters: any[]): Promise<number> {
        const totalResult = await db
            .select({
                totalStorage: sql<number>`SUM(${files.size})`,
            })
            .from(files)
            .where(and(...filters));

        return totalResult[0]?.totalStorage || 0;
    }

    async getTotalFileCount(filters: any[]): Promise<number> {
        const countResult = await db
            .select({
                totalFiles: sql<number>`COUNT(${files.id})`,
            })
            .from(files)
            .where(and(...filters));

        return countResult[0]?.totalFiles || 0;
    }

    async getStorageBreakdown(filters: any[]): Promise<{ fileType: string; storage: number; count: number }[]> {
        const breakdownResult = await db
            .select({
                fileType: files.type,
                storage: sql<number>`SUM(${files.size})`,
                count: sql<number>`COUNT(${files.id})`,
            })
            .from(files)
            .where(and(...filters))
            .groupBy(files.type);

        return breakdownResult;
    }

    public async getArchivedFilesByUser(userId: number) {
        const archivedFiles = await db.select()
            .from(files)
            .where(
                and(
                    eq(files.uploaded_by, userId),
                    eq(files.status, 'archived')
                )
            );

        return archivedFiles;
    }

    public async deleteArchivedFiles(archivedFiles: any[]) {
        const archivedFileIds = archivedFiles.map((file) => file.id);

        const deletedFiles = await db.delete(files)
            .where(inArray(files.id, archivedFileIds))
            .returning();

        return deletedFiles;
    }

    public async updateFilesStatusToActive(archivedFiles: any[]) {
        const archivedFileIds = archivedFiles.map((file) => file.id);

        const updatedFiles = await db.update(files)
            .set({ status: 'active' })
            .where(inArray(files.id, archivedFileIds))
            .returning();

        return updatedFiles;
    }

    public async findAllUserwise({ offset, limit, filters, sort }: { offset: number; limit: number; filters?: string; sort?: string }) {
        try {
            const query = db
                .select({
                    file_id: files.id,
                    title: files.title,
                    name: files.name,
                    mime_type: files.mime_type,
                    size: files.size,
                    path: files.path,
                    uploaded_at: files.uploaded_at,
                    status: files.status,
                    type: files.type,
                    created_at: files.created_at,
                    updated_at: files.updated_at,
                })
                .from(files);

            if (filters) {
                query.where(sql`${sql.raw(filters)}`);
            }

            if (sort) {
                query.orderBy(sql`${sql.raw(sort)}`);
            }

            query.limit(limit).offset(offset);

            const data = await query.execute();
            return data;
        } catch (error) {
            console.error('Service Error:', error);
            throw error;
        }
    }
}

export const fileService = new FileService();

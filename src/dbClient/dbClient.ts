import { db } from "../lib/db";
import { DBRecord, DBTable, NewDBRecord } from "../utils/types";
import { eq, getTableName, sql,and,ne } from "drizzle-orm";

const addSingleRecord = async<R extends DBRecord> (tableName:DBTable, data: NewDBRecord) => {
    const responseData = await db.insert(tableName).values(data).returning();
    return responseData[0] as R;
}
const getRecordByColumn = async <R extends DBRecord>(tableName: DBTable, column: string, value: string | number) => {
  const columnInfo = sql.raw(`${getTableName(tableName)}.${column}`);
  const userData = await db.select().from(tableName).where(eq(columnInfo, value));
  return userData[0] as R;

}
export {
  addSingleRecord,
  getRecordByColumn
}


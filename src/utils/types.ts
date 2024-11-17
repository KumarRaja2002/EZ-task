
import { NewUser, User, UserTable } from "../schemas/user";
import { File, FileTable, NewFile } from "../schemas/file";


export type DBRecord = User | File
export type NewDBRecord = NewUser | NewFile 
export type DBTable = UserTable  |FileTable

import * as bcrypt from 'bcrypt';
import { eq } from "drizzle-orm";
import { db } from '../../lib/db';
import { NewUser, User, users } from '../../schemas/user';
import { addSingleRecord,getRecordByColumn } from '../../dbClient/dbClient';
import { NewDBRecord } from '../../utils/types';

export class UserDataServiceProvider {

    public async create(userData: NewUser) {
        const hashedPassword = await bcrypt.hash(userData.password, 10);
        userData.password = hashedPassword;
        return await addSingleRecord<User>(users, userData);
    }

    public async findUserByEmail(email: string) {
        return await getRecordByColumn<User>(users, 'email', email);
    }

    public async findUserById(id: number) {
        return await getRecordByColumn<User>(users, 'id', id);
    }
    public async updateEmailVerifiedStatus(email: string) {
        const [updatedUser] = await db
          .update(users)
          .set({ email_verified: true })
          .where(eq(users.email, email))
          .returning();
    
        return updatedUser || null;
      }

    
}
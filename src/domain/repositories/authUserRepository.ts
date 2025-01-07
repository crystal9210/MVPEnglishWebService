import { inject, injectable } from "tsyringe";
import { IAuthUserRepository } from "@/interfaces/repositories/IAuthUserRepository";
import type { IFirebaseAdmin } from "@/interfaces/services/IFirebaseAdmin";
import { AdapterUser } from "next-auth/adapters";
import { TSYRINGE_TOKENS } from "@/constants/tsyringe-tokens";

@injectable()
export class AuthUserRepository implements IAuthUserRepository {
    constructor(
        @inject(TSYRINGE_TOKENS.IFirebaseAdmin)
        private firebaseAdmin: IFirebaseAdmin
    ) {}

    /**
     * Retrieve the “users” collection in Firestore.
     * @returns Firestore collection reference.
     */
    private get collection() {
        return this.firebaseAdmin.getFirestore().collection("users");
    }

    /**
     * Creates a new user in the database.
     * @param user - The user data to create.
     */
    async createUser(user: AdapterUser): Promise<AdapterUser> {
        await this.collection.doc(user.id).set({
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            emailVerified: user.emailVerified
                ? this.firebaseAdmin.getFieldValue().serverTimestamp()
                : null,
            createdAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
            updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
        });
        return user;
    }

    /**
     * Finds a user by their ID.
     * @param id - The user ID.
     * @returns The user or null if not found.
     */
    async findUserById(id: string): Promise<AdapterUser | null> {
        const doc = await this.collection.doc(id).get();
        if (!doc.exists) return null;
        const data = doc.data();
        return data
            ? {
                  id,
                  email: data.email,
                  name: data.name || null,
                  image: data.image || null,
                  emailVerified: data.emailVerified
                      ? data.emailVerified.toDate()
                      : null,
              }
            : null;
    }

    /**
     * Finds a user by their email.
     * @param email - The user's email.
     * @returns The user or null if not found.
     */
    async findUserByEmail(email: string): Promise<AdapterUser | null> {
        const querySnapshot = await this.collection
            .where("email", "==", email)
            .limit(1)
            .get();
        if (querySnapshot.empty) return null;
        const doc = querySnapshot.docs[0];
        const data = doc.data();
        return data
            ? {
                  id: doc.id,
                  email: data.email,
                  name: data.name || null,
                  image: data.image || null,
                  emailVerified: data.emailVerified
                      ? data.emailVerified.toDate()
                      : null,
              }
            : null;
    }

    /**
     * Updates a user's data.
     * @param user - Partial user data with the user ID.
     */
    async updateUser(
        user: Partial<AdapterUser> & Pick<AdapterUser, "id">
    ): Promise<AdapterUser> {
        const updates: any = {
            updatedAt: this.firebaseAdmin.getFieldValue().serverTimestamp(),
        };

        if (user.name !== undefined) updates.name = user.name;
        if (user.image !== undefined) updates.image = user.image;
        if (user.emailVerified !== undefined)
            updates.emailVerified = user.emailVerified
                ? this.firebaseAdmin.getFieldValue().serverTimestamp()
                : null;

        await this.collection.doc(user.id).update(updates);

        const updatedUser = await this.findUserById(user.id);
        if (!updatedUser) {
            throw new Error(`User with ID ${user.id} not found after update.`);
        }
        return updatedUser;
    }

    /**
     * Deletes a user by their ID.
     * @param id - The user ID.
     */
    async deleteUser(id: string): Promise<void> {
        await this.collection.doc(id).delete();
    }
}

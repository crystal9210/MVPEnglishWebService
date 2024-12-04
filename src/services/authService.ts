import { injectable, inject } from "tsyringe";
import { firestoreAdmin } from "./firebaseAdmin";
import { AdapterAccount } from "next-auth/adapters";
import { AdapterUser } from "next-auth/adapters";

@injectable()
export class AuthService {
    constructor(
        @injectable("FirebaseAdmin") private firebaseAdmin: firestoreAdmin
    ) {}
}

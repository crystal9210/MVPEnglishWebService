import { firestore } from "./firebaseClient";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { ProblemSchema, Problem } from "../schemas/problemSchemas";
import { injectable } from "tsyringe";

@injectable()
export class ProblemService {
    async getProblemsByCategory(category: string): Promise<Problem[]> {
        const problemsRef = collection(firestore, "problems");
        const q = query(problemsRef, where("category", "==", category));
        const querySnapshot = await getDocs(q);

        const problems: Problem[] = [];
        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const parsed = ProblemSchema.safeParse(data);
            if (parsed.success) {
                problems.push(parsed.data);
            }
        });
        return problems;
    }

    async getProblemById(id: string): Promise<Problem | null> {
        const problemRef = doc(firestore, "problems", id);
        const docSnap = await getDoc(problemRef);
        if (docSnap.exists()) {
            const data = docSnap.data();
            const parsed = ProblemSchema.safeParse(data);
            if (parsed.success) {
                return parsed.data;
            }
        }
        return null;
    }
}

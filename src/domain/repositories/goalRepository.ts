import { injectable } from 'tsyringe';
import { Firestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, getDocs } from 'firebase/firestore';
import { Goal, GoalSchema } from '@/schemas/goalSchemas';

@injectable()
export class GoalRepository {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  private getGoalsCollection(userId: string) {
    return collection(this.db, 'users', userId, 'goals');
  }

  async createGoal(userId: string, goal: Goal): Promise<string> {
    const goalsCol = this.getGoalsCollection(userId);
    const goalDoc = doc(goalsCol);
    await setDoc(goalDoc, GoalSchema.parse(goal));
    return goalDoc.id;
  }

  async getGoal(userId: string, goalId: string): Promise<{ id: string } & Goal | null> {
    const goalDoc = doc(this.getGoalsCollection(userId), goalId);
    const docSnap = await getDoc(goalDoc);
    if (docSnap.exists()) {
      return { id: goalId, ...GoalSchema.parse(docSnap.data()) };
    }
    return null;
  }

  async updateGoal(userId: string, goalId: string, updates: Partial<Goal>): Promise<void> {
    const goalDoc = doc(this.getGoalsCollection(userId), goalId);
    const parsedUpdates = GoalSchema.partial().parse(updates);
    await updateDoc(goalDoc, parsedUpdates);
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goalDoc = doc(this.getGoalsCollection(userId), goalId);
    await deleteDoc(goalDoc);
  }

  async getAllGoals(userId: string): Promise<{ id: string } & Goal[]> {
    const goalsCol = this.getGoalsCollection(userId);
    const querySnapshot = await getDocs(goalsCol);
    return querySnapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...GoalSchema.parse(docSnap.data()),
    }));
  }
}

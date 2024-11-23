// app/dashboard/_components/utils.ts
import { TodoItem, GoalItem } from "./mockData";

export const getStoredTodos = (serviceName: string): TodoItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`todos_${serviceName}`);
    return stored ? JSON.parse(stored) : [];
};

export const storeTodos = (serviceName: string, todos: TodoItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`todos_${serviceName}`, JSON.stringify(todos));
};

export const getStoredGoals = (serviceName: string): GoalItem[] => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(`goals_${serviceName}`);
    return stored ? JSON.parse(stored) : [];
};

export const storeGoals = (serviceName: string, goals: GoalItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`goals_${serviceName}`, JSON.stringify(goals));
};

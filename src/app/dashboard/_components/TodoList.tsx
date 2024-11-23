// app/dashboard/_components/TodoList.tsx

"use client";

import { useState, useEffect } from "react";
import { TodoItem, mockTodosPerService } from "./mockData";
import { getStoredTodos, storeTodos } from "./utils";
import { toast } from "react-toastify";

type TodoListProps = {
    serviceName: string;
};

export default function TodoList({ serviceName }: TodoListProps) {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [newTask, setNewTask] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [editTask, setEditTask] = useState<string>("");

    // 初期データの取得
    useEffect(() => {
        const stored = getStoredTodos(serviceName);
        if (stored.length > 0) {
            setTodos(stored);
        } else {
            setTodos(mockTodosPerService[serviceName] || []);
        }
    }, [serviceName]);

    // データの保存
    useEffect(() => {
        storeTodos(serviceName, todos);
    }, [todos, serviceName]);

    const toggleCompletion = (id: string) => {
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === id ? { ...todo, completed: !todo.completed } : todo
            )
        );
    };

    const addTask = () => {
        if (newTask.trim() === "") {
            toast.error("タスクを入力してください。");
            return;
        }
        const newTodo: TodoItem = {
            id: Date.now().toString(),
            task: newTask.trim(),
            completed: false,
        };
        setTodos((prev) => [...prev, newTodo]);
        setNewTask("");
        toast.success("タスクが追加されました！");
    };

    const startEditing = (todo: TodoItem) => {
        setEditingTodo(todo);
        setEditTask(todo.task);
    };

    const cancelEditing = () => {
        setEditingTodo(null);
        setEditTask("");
    };

    const saveEdit = () => {
        if (editTask.trim() === "" || !editingTodo) {
            toast.error("タスク名を入力してください。");
            return;
        }
        setTodos((prev) =>
            prev.map((todo) =>
                todo.id === editingTodo.id ? { ...todo, task: editTask.trim() } : todo
            )
        );
        cancelEditing();
        toast.success("タスクが更新されました！");
    };

    const deleteTodo = (id: string) => {
        setTodos((prev) => prev.filter((todo) => todo.id !== id));
        toast.info("タスクが削除されました。");
    };

    return (
        <div className="bg-white p-6 rounded shadow mb-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">TODOリスト - {serviceName}</h2>
            {/* タスク追加フォーム */}
            <div className="flex mb-4">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="新しいタスクを追加"
                    className="flex-grow p-2 border rounded-l dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
                <button
                    onClick={addTask}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-r"
                >
                    追加
                </button>
            </div>
            {/* タスク一覧 */}
            <ul>
                {todos.map((todo) => (
                    <li key={todo.id} className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                checked={todo.completed}
                                onChange={() => toggleCompletion(todo.id)}
                                className="h-5 w-5 text-indigo-600"
                            />
                            {editingTodo?.id === todo.id ? (
                                <input
                                    type="text"
                                    value={editTask}
                                    onChange={(e) => setEditTask(e.target.value)}
                                    className="ml-3 p-1 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                />
                            ) : (
                                <span
                                    className={`ml-3 text-lg ${
                                        todo.completed ? "line-through text-gray-400" : "text-gray-700 dark:text-gray-200"
                                    }`}
                                >
                                    {todo.task}
                                </span>
                            )}
                        </div>
                        <div className="flex space-x-2">
                            {editingTodo?.id === todo.id ? (
                                <>
                                    <button
                                        onClick={saveEdit}
                                        className="text-green-500 hover:text-green-700"
                                    >
                                        保存
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        キャンセル
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        onClick={() => startEditing(todo)}
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        編集
                                    </button>
                                    <button
                                        onClick={() => deleteTodo(todo.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        削除
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}

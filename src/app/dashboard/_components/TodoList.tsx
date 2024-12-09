"use client";

import { useState, useEffect } from "react";
import { TodoItem, mockTodosPerService } from "./mockData";
import { getStoredTodos, storeTodos } from "./utils";
import { toast } from "react-toastify";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SortableItem } from "./SortableItem";
import { SortableTrash } from "./SortableTrash";
import { v4 as uuidv4 } from "uuid";

type TodoListProps = {
    serviceName: string;
};

export default function TodoList({ serviceName }: TodoListProps) {
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [deletedTodos, setDeletedTodos] = useState<TodoItem[]>([]);
    const [newTask, setNewTask] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [editTask, setEditTask] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // クライアントサイドでのみ動作させるためのマウントフラグ
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = getStoredTodos(serviceName);
        if (stored.length > 0) {
            setTodos(stored);
        } else {
            setTodos(mockTodosPerService[serviceName] || []);
        }
    }, [serviceName]);

    // データの保存
    useEffect(() => {
        if (mounted) {
            storeTodos(serviceName, todos);
        }
    }, [todos, serviceName, mounted]);

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
            id: uuidv4(), // UUIDを使用して一意なIDを生成
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
                todo.id === editingTodo.id
                    ? { ...todo, task: editTask.trim() }
                    : todo
            )
        );
        cancelEditing();
        toast.success("タスクが更新されました！");
    };

    const deleteTodo = (id: string) => {
        const todoToDelete = todos.find((todo) => todo.id === id);
        if (todoToDelete) {
            setTodos((prev) => prev.filter((todo) => todo.id !== id));
            setDeletedTodos((prev) => [todoToDelete, ...prev]);
            toast.info("タスクが削除されました。");
        }
    };

    const handleUndo = () => {
        if (deletedTodos.length === 0) return;
        const [restoredTodo, ...rest] = deletedTodos;
        setTodos((prev) => [restoredTodo, ...prev]);
        setDeletedTodos(rest);
        toast.success(`"${restoredTodo.task}" を復元しました。`);
    };

    // センサーの設定
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        try {
            const { active, over } = event;

            if (!over) {
                return;
            }

            if (over.id === "trash") {
                const todoToDelete = todos.find((todo) => todo.id === active.id);
                if (todoToDelete) {
                    setTodos((prev) => prev.filter((todo) => todo.id !== active.id));
                    setDeletedTodos((prev) => [todoToDelete, ...prev]);
                    toast.info(`"${todoToDelete.task}" を削除しました。`);
                }
                return;
            }

            if (active.id !== over.id) {
                setTodos((items) => {
                    const oldIndex = items.findIndex((item) => item.id === active.id);
                    const newIndex = items.findIndex((item) => item.id === over.id);
                    return arrayMove(items, oldIndex, newIndex);
                });
            }
        } catch (error) {
            console.error("Drag and Drop Error:", error);
            toast.error("ドラッグ＆ドロップ中にエラーが発生しました。");
        }
    };

    // 検索機能
    const filteredTodos = todos.filter((todo) =>
        todo.task.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (!mounted) {
        return null; // クライアントサイドでのみレンダリング
    }

    return (
        <div className="bg-white p-6 rounded shadow mb-6 relative">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
                TODOリスト - {serviceName}
            </h2>
            {/* Undoボタン */}
            {deletedTodos.length > 0 && (
                <button
                    onClick={handleUndo}
                    className="mb-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                >
                    戻す
                </button>
            )}
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
            {/* 検索フォーム */}
            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="タスクを検索"
                    className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
            </div>
            {/* ローディングインジケーター */}
            {isLoading ? (
                <div className="flex justify-center items-center">
                    <svg
                        className="animate-spin h-8 w-8 text-indigo-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v8H4z"
                        ></path>
                    </svg>
                </div>
            ) : (
                /* タスク一覧 */
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={filteredTodos.map((todo) => todo.id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul>
                            {filteredTodos.map((todo) => (
                                <SortableItem
                                    key={todo.id}
                                    id={todo.id}
                                    todo={todo}
                                    toggleCompletion={toggleCompletion}
                                    startEditing={startEditing}
                                    deleteTodo={deleteTodo}
                                    isEditing={editingTodo?.id === todo.id}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                    {/* ゴミ箱エリア */}
                    <SortableTrash
                        id="trash"
                        className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-300 bg-opacity-50 rounded-full p-4 flex items-center justify-center transition-all duration-300`}
                    />
                </DndContext>
            )}
            {/* 編集フォーム */}
            {editingTodo && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded shadow z-50">
                    <h3 className="text-xl mb-4">タスクを編集</h3>
                    <input
                        type="text"
                        value={editTask}
                        onChange={(e) => setEditTask(e.target.value)}
                        className="w-full p-2 border rounded mb-4"
                    />
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={saveEdit}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                            保存
                        </button>
                        <button
                            onClick={cancelEditing}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded"
                        >
                            キャンセル
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

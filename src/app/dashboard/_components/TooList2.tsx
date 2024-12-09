"use client";

import { useState, useEffect } from "react";
import { TodoItem } from "./mockData";
import { toast } from "react-toastify";
import { DragDropContext, Droppable, Draggable, DropResult } from "react-beautiful-dnd";
import { FiTrash2 } from "react-icons/fi";
import { useSession } from "next-auth/react";

type TodoListProps = {
    serviceName: string;
};

export default function TodoList({ serviceName }: TodoListProps) {
    const { data: session, status } = useSession();
    const [todos, setTodos] = useState<TodoItem[]>([]);
    const [deletedTodos, setDeletedTodos] = useState<TodoItem[]>([]);
    const [newTask, setNewTask] = useState<string>("");
    const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);
    const [editTask, setEditTask] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchTerm, setSearchTerm] = useState<string>("");

    // 初期データの取得
    useEffect(() => {
        const fetchTodos = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/todos?serviceName=${serviceName}`);
                if (!res.ok) throw new Error('データの取得に失敗しました。');
                const data: TodoItem[] = await res.json();
                setTodos(data);
            } catch (error) {
                toast.error('タスクの取得に失敗しました。');
            } finally {
                setIsLoading(false);
            }
        };
        if (status === "authenticated") {
            fetchTodos();
        }
    }, [serviceName, status]);

    // セッションが切れたら削除した項目をクリア
    useEffect(() => {
        if (status !== "authenticated") {
            setDeletedTodos([]);
        }
    }, [status]);

    const toggleCompletion = async (id: string) => {
        const todo = todos.find(t => t.id === id);
        if (!todo) return;

        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ completed: !todo.completed }),
            });
            if (!res.ok) throw new Error('更新に失敗しました。');
            const updatedTodo: TodoItem = await res.json();
            setTodos(todos.map(t => t.id === id ? updatedTodo : t));
            toast.success("タスクが更新されました！");
        } catch (error) {
            toast.error('タスクの更新に失敗しました。');
        }
    };

    const addTask = async () => {
        if (newTask.trim() === "") {
            toast.error("タスクを入力してください。");
            return;
        }
        try {
            const res = await fetch('/api/todos', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: newTask.trim(), service: serviceName }),
            });
            if (!res.ok) throw new Error('タスクの追加に失敗しました。');
            const newTodo: TodoItem = await res.json();
            setTodos([newTodo, ...todos]);
            setNewTask("");
            toast.success("タスクが追加されました！");
        } catch (error) {
            toast.error('タスクの追加に失敗しました。');
        }
    };

    const startEditing = (todo: TodoItem) => {
        setEditingTodo(todo);
        setEditTask(todo.task);
    };

    const cancelEditing = () => {
        setEditingTodo(null);
        setEditTask("");
    };

    const saveEdit = async () => {
        if (editTask.trim() === "" || !editingTodo) {
            toast.error("タスク名を入力してください。");
            return;
        }
        try {
            const res = await fetch(`/api/todos/${editingTodo.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ task: editTask.trim(), completed: editingTodo.completed }),
            });
            if (!res.ok) throw new Error('タスクの更新に失敗しました。');
            const updatedTodo: TodoItem = await res.json();
            setTodos(todos.map(t => t.id === updatedTodo.id ? updatedTodo : t));
            setEditingTodo(null);
            setEditTask("");
            toast.success("タスクが更新されました！");
        } catch (error) {
            toast.error('タスクの更新に失敗しました。');
        }
    };

    const deleteTodo = async (id: string) => {
        try {
            const res = await fetch(`/api/todos/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('タスクの削除に失敗しました。');
            const deletedTodo = todos.find(t => t.id === id);
            if (deletedTodo) {
                setTodos(todos.filter(t => t.id !== id));
                setDeletedTodos([deletedTodo, ...deletedTodos]);
                toast.info(`"${deletedTodo.task}" を削除しました。`);
            }
        } catch (error) {
            toast.error('タスクの削除に失敗しました。');
        }
    };

    const handleUndo = () => {
        if (deletedTodos.length === 0) return;
        const [restoredTodo, ...rest] = deletedTodos;
        setTodos([restoredTodo, ...todos]);
        setDeletedTodos(rest);
        toast.success(`"${restoredTodo.task}" を復元しました。`);
    };

    const handleOnDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return; // ドラッグがキャンセルされた場合

        // ゴミ箱エリアにドラッグされた場合
        if (destination.droppableId === "trash") {
            const todoToDelete = todos.find(todo => todo.id === draggableId);
            if (todoToDelete) {
                setTodos(prev => prev.filter(todo => todo.id !== draggableId));
                setDeletedTodos(prev => [todoToDelete, ...prev]);
                toast.info(`"${todoToDelete.task}" を削除しました。`);
            }
            return;
        }

        // 並べ替えが行われた場合
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return; // 位置が変わっていない場合
        }

        const reorderedTodos = Array.from(todos);
        const [movedTodo] = reorderedTodos.splice(source.index, 1);
        reorderedTodos.splice(destination.index, 0, movedTodo);
        setTodos(reorderedTodos);
    };

    const filteredTodos = todos.filter((todo) =>
        todo.task.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-white p-6 rounded shadow mb-6 relative">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">TODOリスト - {serviceName}</h2>
            {/* Undoボタン */}
            {deletedTodos.length > 0 && status === "authenticated" && (
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
                    className="flex-grow p-2 border rounded-l"
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
                    className="w-full p-2 border rounded"
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
                <DragDropContext onDragEnd={handleOnDragEnd}>
                    <Droppable droppableId="todos">
                        {(provided) => (
                            <ul {...provided.droppableProps} ref={provided.innerRef}>
                                {filteredTodos.map((todo, index) => (
                                    <Draggable key={todo.id} draggableId={todo.id} index={index}>
                                        {(provided, snapshot) => (
                                            <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`flex items-center justify-between mb-4 bg-gray-100 p-2 rounded ${
                                                    snapshot.isDragging ? "bg-blue-100 shadow-lg" : ""
                                                }`}
                                            >
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
                                                            className="ml-3 p-1 border rounded"
                                                        />
                                                    ) : (
                                                        <span
                                                            className={`ml-3 text-lg cursor-pointer ${
                                                                todo.completed ? "line-through text-gray-400" : "text-gray-700"
                                                            }`}
                                                            onDoubleClick={() => startEditing(todo)}
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
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </ul>
                        )}
                    </Droppable>
                    {/* ゴミ箱エリア */}
                    <Droppable droppableId="trash">
                        {(provided, snapshot) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className={`fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-300 bg-opacity-50 rounded-full p-4 flex items-center justify-center transition-all duration-300 ${
                                    snapshot.isDraggingOver ? "bg-red-400 bg-opacity-70" : ""
                                }`}
                            >
                                <FiTrash2 className="h-8 w-8 text-red-600" />
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}</div>
        );
}

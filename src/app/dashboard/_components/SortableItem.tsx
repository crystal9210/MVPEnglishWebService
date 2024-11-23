// app/dashboard/_components/SortableItem.tsx

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "react";
import { TodoItem } from "./mockData";
import { FiMenu } from "react-icons/fi"; // 正しいアイコンをインポート

type SortableItemProps = {
    id: string;
    todo: TodoItem;
    toggleCompletion: (id: string) => void;
    startEditing: (todo: TodoItem) => void;
    deleteTodo: (id: string) => void;
    isEditing: boolean;
};

export const SortableItem: React.FC<SortableItemProps> = ({
    id,
    todo,
    toggleCompletion,
    startEditing,
    deleteTodo,
    isEditing,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    // イベント伝播を停止する関数
    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        action: () => void
    ) => {
        e.stopPropagation(); // イベントの伝播を停止
        action();
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between mb-4 bg-gray-100 p-2 rounded relative ${
                isDragging ? "bg-blue-100 shadow-lg" : ""
            }`}
        >
            {/* ドラッグハンドル */}
            <div
                {...attributes}
                {...listeners}
                className="mr-2 cursor-grab"
                style={{ display: "flex", alignItems: "center" }}
            >
                <FiMenu className="h-5 w-5 text-gray-500" /> {/* 正しいアイコンを使用 */}
            </div>

            {/* タスク内容 */}
            <div className="flex items-center flex-grow">
                <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleCompletion(todo.id)}
                    className="h-5 w-5 text-indigo-600"
                />
                {todo.completed ? (
                    <span className="ml-3 text-lg line-through text-black">
                        {todo.task}
                    </span>
                ) : (
                    <span
                        className="ml-3 text-lg cursor-pointer text-black"
                        onDoubleClick={() => startEditing(todo)}
                    >
                        {todo.task}
                    </span>
                )}
            </div>

            {/* 編集および削除ボタン */}
            <div className="flex space-x-2 z-10">
                {!isEditing && (
                    <>
                        <button
                            onClick={(e) =>
                                handleButtonClick(e, () => startEditing(todo))
                            }
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                            編集
                        </button>
                        <button
                            onClick={(e) =>
                                handleButtonClick(e, () => deleteTodo(todo.id))
                            }
                            className="text-red-500 hover:text-red-700 focus:outline-none"
                        >
                            削除
                        </button>
                    </>
                )}
            </div>
        </li>
    );
};

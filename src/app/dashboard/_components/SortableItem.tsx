import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CSSProperties } from "react";
import { TodoItem } from "./mockData";

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

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        toggleCompletion(todo.id);
    };

    const handleButtonClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
        action: () => void
    ) => {
        e.stopPropagation(); // ボタンのクリックイベントがドラッグと競合しないように停止
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
            {/* チェックボックス */}
            <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleCheckboxChange}
                className="h-5 w-5 text-indigo-600"
            />

            {/* タスク内容 */}
            <span
                {...attributes}
                {...listeners}
                className={`ml-3 text-lg cursor-grab flex-grow ${
                    todo.completed ? "line-through text-gray-500" : "text-black"
                }`}
            >
                {todo.task}
            </span>

            {/* 編集および削除ボタン */}
            <div className="flex space-x-2 z-10">
                {!isEditing && (
                    <>
                        <button
                            onClick={(e) => {
                                handleButtonClick(e, () => startEditing(todo));
                            }}
                            className="text-blue-500 hover:text-blue-700 focus:outline-none"
                        >
                            編集
                        </button>
                        <button
                            onClick={(e) => {
                                handleButtonClick(e, () => deleteTodo(todo.id));
                            }}
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

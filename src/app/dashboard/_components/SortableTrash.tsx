// app/dashboard/_components/SortableTrash.tsx

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { FiTrash2 } from "react-icons/fi"; // 正しくインポート

type SortableTrashProps = {
    id: string;
    className: string;
};

export const SortableTrash: React.FC<SortableTrashProps> = ({
    id,
    className,
}) => {
    const { isOver, setNodeRef } = useDroppable({
        id,
    });

    const style = {
        backgroundColor: isOver
            ? "rgba(220, 38, 38, 0.7)"
            : "rgba(107, 114, 128, 0.5)",
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`${className} ${
                isOver ? "bg-red-400 bg-opacity-70" : ""
            }`}
        >
            <FiTrash2 className="h-8 w-8 text-red-600" />
        </div>
    );
};

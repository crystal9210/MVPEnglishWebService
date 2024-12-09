import React from "react";

interface ModalProps {
    title: string;
    message: string;
    onClose: () => void;
}

const Modal= ({ title, message, onClose }: ModalProps) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-96">
                <h2 className="text-xl font-semibold mb-4">{title}</h2>
                <p className="text-gray-700 mb-6">{message}</p>
                <button
                onClick={onClose}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                閉じる
                </button>
            </div>
    </div>
    )
}

export default Modal;

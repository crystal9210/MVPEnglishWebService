"use client";

interface ModalProps {
    isVisible: boolean;
    onClose: () => void;
    onNavigate: () => void;
}

export const Modal: React.FC<ModalProps> = ({ isVisible, onClose, onNavigate }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-center">
                <h2 className="text-lg font-bold mb-4">登録が必要です</h2>
                <p className="text-gray-700 mb-6">
                    アカウントが登録されていません。以下からお選びください。
                </p>
                <button
                    onClick={onNavigate}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mb-4"
                >
                    登録へ
                </button>
                <button
                    onClick={onClose}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                >
                    ホームページへ
                </button>
            </div>
        </div>
    );
};

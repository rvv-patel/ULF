import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AssignmentModalProps {
    isOpen: boolean;
    title: string;
    items: { id: number | string; name: string }[];
    selectedIds: (number | string)[];
    onClose: () => void;
    onSave: (selectedIds: (number | string)[]) => void;
}

export const AssignmentModal: React.FC<AssignmentModalProps> = ({
    isOpen,
    title,
    items,
    selectedIds,
    onClose,
    onSave,
}) => {
    const [currentSelection, setCurrentSelection] = useState<(number | string)[]>([]);

    useEffect(() => {
        if (isOpen) {
            setCurrentSelection(selectedIds || []); // Ensure it's an array
        }
    }, [isOpen, selectedIds]);

    if (!isOpen) return null;

    const toggleSelection = (id: number | string) => {
        setCurrentSelection(prev =>
            prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id]
        );
    };

    const handleSave = () => {
        onSave(currentSelection);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="space-y-3">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <label
                                    key={item.id}
                                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors cursor-pointer"
                                >
                                    <input
                                        type="checkbox"
                                        checked={currentSelection.includes(item.id)}
                                        onChange={() => toggleSelection(item.id)}
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-gray-700 font-medium">{item.name}</span>
                                </label>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-4">No items available</div>
                        )}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-100 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

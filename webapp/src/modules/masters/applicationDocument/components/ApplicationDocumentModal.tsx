import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { ApplicationDocument } from '../types';

interface ApplicationDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<ApplicationDocument>) => void;
    editData?: ApplicationDocument | null;
}

export default function ApplicationDocumentModal({ isOpen, onClose, onSave, editData }: ApplicationDocumentModalProps) {
    const [title, setTitle] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (editData) {
            setTitle(editData.title);
        } else {
            setTitle('');
        }
        setError('');
    }, [editData, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError('Title is required');
            return;
        }

        onSave({
            id: editData?.id,
            title: title.trim(),
            documentFormat: 'PDF' // Always PDF
        });

        handleClose();
    };

    const handleClose = () => {
        setTitle('');
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-xl font-bold text-gray-900">
                            {editData ? 'Edit Document' : 'New Document'}
                        </h2>
                        <button
                            onClick={handleClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Title Field */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setError('');
                                }}
                                className={`w-full px-4 py-2.5 border ${error ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
                                placeholder="e.g. Partnership Deed"
                                autoFocus
                            />
                            {error && (
                                <p className="mt-1 text-sm text-red-500">{error}</p>
                            )}
                        </div>

                        {/* Document Format (Read-only) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Format
                            </label>
                            <div className="px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-600">
                                PDF
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                            >
                                {editData ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

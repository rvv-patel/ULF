import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface QueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (query: { date: string; queryDetails: string; remarks: string; isResolved?: boolean }) => void;
    initialData?: {
        date: string;
        queryDetails: string;
        remarks: string;
        isResolved?: boolean;
    } | null;
}

export const QueryModal: React.FC<QueryModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
    const [date, setDate] = useState('');
    const [queryDetails, setQueryDetails] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isResolved, setIsResolved] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setDate(initialData.date || new Date().toISOString().split('T')[0]);
                setQueryDetails(initialData.queryDetails || '');
                setRemarks(initialData.remarks || '');
                setIsResolved(initialData.isResolved || false);
            } else {
                // New Query Defaults
                setDate(new Date().toISOString().split('T')[0]);
                setQueryDetails('');
                setRemarks('');
                setIsResolved(false);
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = () => {
        if (!date || !queryDetails) {
            alert('Please fill in required fields');
            return;
        }
        onSave({ date, queryDetails, remarks, isResolved });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        {initialData ? 'Edit Query' : 'Add New Query'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Date Field */}
                    <div className="relative">
                        <label className="block text-sm font-medium text-gray-500 mb-1 bg-white px-1 -mt-2.5 ml-3 absolute top-0">Date *</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pt-3"
                        />
                    </div>

                    {/* Query Details Field */}
                    <div className="relative pt-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1 bg-white px-1 -mt-2.5 ml-3 absolute top-2">Query Details *</label>
                        <textarea
                            value={queryDetails}
                            onChange={(e) => setQueryDetails(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder=""
                        />
                    </div>

                    {/* Remarks Field */}
                    <div className="relative pt-2">
                        <label className="block text-sm font-medium text-gray-500 mb-1 bg-white px-1 -mt-2.5 ml-3 absolute top-2">Remarks</label>
                        <textarea
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            rows={2}
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder=""
                        />
                    </div>

                    {initialData && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isResolved"
                                checked={isResolved}
                                onChange={(e) => setIsResolved(e.target.checked)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor="isResolved" className="text-sm text-gray-700">Mark as Resolved</label>
                        </div>
                    )}

                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-3 bg-gray-50 rounded-b-lg">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Cancle
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Save
                    </button>
                    <button
                        onClick={handleSubmit} // For now, same action as Save. Implementation of 'Save & Email' would require more backend logic.
                        className="px-6 py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors"
                    >
                        Save & Email
                    </button>
                </div>
            </div>
        </div>
    );
};

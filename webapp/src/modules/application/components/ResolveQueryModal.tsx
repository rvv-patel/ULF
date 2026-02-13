import React, { useState } from 'react';
import { X, AlertCircle, Calendar, User, MessageCircle } from 'lucide-react';

interface ResolveQueryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onResolve: (withEmail: boolean, remark: string) => void;
    query: any;
}

export const ResolveQueryModal: React.FC<ResolveQueryModalProps> = ({ isOpen, onClose, onResolve, query }) => {
    const [resolutionRemark, setResolutionRemark] = useState('');

    if (!isOpen || !query) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <h2 className="text-xl font-bold text-gray-900">Resolve Query</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6 flex items-start gap-3 p-4 bg-blue-50 text-blue-800 rounded-xl border border-blue-100">
                        <AlertCircle className="shrink-0 mt-0.5" size={20} />
                        <div className="text-sm leading-relaxed">
                            <span className="font-semibold block mb-1">Confirm Resolution</span>
                            Are you sure you want to mark this query as resolved? This indicates the issue has been handled.
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Calendar size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Date</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{query.date}</span>
                        </div>

                        <div className="space-y-1">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Query</span>
                            <p className="text-sm text-gray-800 font-medium leading-relaxed">
                                {query.queryDetails}
                            </p>
                        </div>

                        {query.remarks && (
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-gray-500 mb-1">
                                    <MessageCircle size={14} />
                                    <span className="text-xs font-bold uppercase tracking-wider">Original Remark</span>
                                </div>
                                <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-200">{query.remarks}</p>
                            </div>
                        )}

                        <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-gray-500">
                                <User size={14} />
                                <span className="text-xs font-bold uppercase tracking-wider">Raised By</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100/50 flex items-center justify-center text-xs font-bold text-blue-600">
                                    {(query.raisedBy || 'U').charAt(0)}
                                </span>
                                <span className="text-sm font-semibold text-gray-900">{query.raisedBy}</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 flex justify-between">
                            Resolution Note
                            <span className="text-gray-400 font-normal text-xs">(Optional)</span>
                        </label>
                        <textarea
                            value={resolutionRemark}
                            onChange={(e) => setResolutionRemark(e.target.value)}
                            placeholder="Why is this being resolved? e.g., Documents received..."
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400 min-h-[80px] resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onResolve(false, resolutionRemark)}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all"
                    >
                        Resolve
                    </button>
                    <button
                        onClick={() => onResolve(true, resolutionRemark)}
                        className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all flex items-center gap-2 border-l border-blue-500"
                    >
                        Resolve & Email
                    </button>
                </div>
            </div>
        </div>
    );
};

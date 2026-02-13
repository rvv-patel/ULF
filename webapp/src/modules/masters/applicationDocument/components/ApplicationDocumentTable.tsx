import React from 'react';
import { Edit, Trash2, FileText, Upload, Sparkles } from 'lucide-react';
import type { ApplicationDocument } from '../types';
import { useAuth } from '../../../../context/AuthContext';

interface ApplicationDocumentTableProps {
    items: ApplicationDocument[];
    isLoading: boolean;
    sortConfig: { field: keyof ApplicationDocument; direction: 'asc' | 'desc' } | null;
    onSort: (field: keyof ApplicationDocument) => void;
    onDelete: (id: number, title: string) => void;
    onEdit: (id: number) => void;
}

export const ApplicationDocumentTable: React.FC<ApplicationDocumentTableProps> = ({
    items,
    isLoading,
    onDelete,
    onEdit
}) => {
    const { hasPermission } = useAuth();
    if (isLoading) {
        return (
            <div className="p-12 text-center">
                < div className="inline-flex items-center gap-3 text-gray-500" >
                    <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading documents...</span>
                </div >
            </div >
        );
    }

    if (items.length === 0) {
        return (
            <div className="p-16 text-center">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">No documents found</p>
                <p className="text-sm text-gray-400 mt-1">Create your first document to get started</p>
            </div>
        );
    }

    return (
        <div className="overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="backdrop-blur-xl bg-white/40 border-b border-white/20 shadow-sm">
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-16">
                            #
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Document Title
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-40">
                            Type
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-40">
                            Format
                        </th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {items.map((item, index) => (
                        <tr
                            key={item.id}
                            className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-transparent transition-all duration-200"
                        >
                            <td className="px-6 py-4">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 text-gray-600 text-sm font-semibold shadow-sm">
                                    {index + 1}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                                        <FileText className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {item.title}
                                        </p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                                {item.isUploaded && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm">
                                        <Upload className="h-3 w-3" />
                                        Upload
                                    </span>
                                )}
                                {item.isGenerate && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
                                        <Sparkles className="h-3 w-3" />
                                        Generate
                                    </span>
                                )}
                                {!item.isUploaded && !item.isGenerate && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                                        Not Set
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm">
                                    <FileText className="h-3 w-3" />
                                    {item.documentFormat}
                                </span>
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-center gap-2">
                                    {hasPermission('edit_application_documents') && (
                                        <button
                                            onClick={() => onEdit(item.id)}
                                            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 hover:shadow-md transition-all duration-200"
                                            title="Edit"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission('delete_application_documents') && (
                                        <button
                                            onClick={() => onDelete(item.id, item.title)}
                                            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:shadow-md transition-all duration-200"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

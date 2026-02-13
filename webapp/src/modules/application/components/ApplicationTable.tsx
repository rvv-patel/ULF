import React from 'react';
import { Edit, Eye, Trash2, ArrowUpDown, ArrowUp, ArrowDown, Printer, CheckCircle, Clock, XCircle } from 'lucide-react';
import type { Application } from '../types';
import { useAuth } from '../../../context/AuthContext';

interface ApplicationTableProps {
    items: Application[];
    isLoading: boolean;
    sortConfig: { field: keyof Application; direction: 'asc' | 'desc' } | null;
    onSort: (field: keyof Application) => void;
    onDelete: (id: number, referenceNumber: string) => void;
    onEdit: (id: number) => void;
    onView: (id: number) => void;
    onPrint: (item: Application) => void;
}

export const ApplicationTableComponent: React.FC<ApplicationTableProps> = ({
    items,
    isLoading,
    sortConfig,
    onSort,
    onDelete,
    onEdit,
    onView,
    onPrint
}) => {
    const { hasPermission } = useAuth();
    if (isLoading) {
        return (
            <div className="p-12 flex flex-col items-center justify-center text-gray-500">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                <p>Loading applications...</p>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="p-16 text-center text-gray-400 bg-white">
                <div className="mx-auto h-12 w-12 text-gray-300 mb-3">
                    <svg className="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <p className="text-lg font-medium text-gray-900">No applications found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters.</p>
            </div>
        );
    }

    const SortIcon = ({ field }: { field: keyof Application }) => {
        if (sortConfig?.field !== field) return <ArrowUpDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-blue-600 ml-1" />
            : <ArrowDown size={14} className="text-blue-600 ml-1" />;
    };

    const SortableHeader = ({ field, label, align = 'left', className = '' }: { field: keyof Application; label: string; align?: 'left' | 'right'; className?: string }) => (
        <th
            className={`p-4 text-xs font-bold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-50 transition-colors select-none whitespace-nowrap ${align === 'right' ? 'text-right' : 'text-left'} ${className}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : ''}`}>
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );



    return (
        <div className="overflow-x-auto bg-white rounded-lg">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm sticky top-0 z-30">
                        <SortableHeader field="fileNumber" label="File No" className="sticky left-0 z-40 bg-gray-50 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-gray-100/50 min-w-[120px]" />
                        <SortableHeader field="date" label="Date" className="min-w-[120px]" />

                        <SortableHeader field="company" label="Company" className="min-w-[180px]" />
                        <SortableHeader field="applicantName" label="Applicant" className="min-w-[180px]" />
                        <SortableHeader field="proposedOwner" label="Buyer (Proposed)" className="min-w-[160px]" />
                        <SortableHeader field="currentOwner" label="Seller (Current)" className="min-w-[160px]" />
                        <SortableHeader field="propertyAddress" label="Property" className="min-w-[200px]" />
                        <SortableHeader field="branchName" label="Branch" className="min-w-[140px]" />

                        <th className="p-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider sticky right-0 z-40 bg-gray-50 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l border-gray-100/50 min-w-[160px]">
                            Actions
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {items.map((item) => {
                        const hasOpenQuery = item.queries?.some((q: any) => !q.isResolved);

                        // Dynamic Row Styles with Query Priority
                        const rowBaseClass = "group transition-all duration-200 hover:shadow-md hover:z-10 relative";
                        const rowColorClass = hasOpenQuery
                            ? "bg-red-50 hover:bg-red-100 transition-colors"
                            : "hover:bg-slate-50 bg-white transition-colors";

                        // Sticky columns must have solid backgrounds to hide scrolling content
                        const stickyLeftClass = `p-4 text-sm font-semibold text-gray-900 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] border-r border-transparent transition-colors ${hasOpenQuery ? 'bg-red-50 group-hover:bg-red-100' : 'bg-white group-hover:bg-slate-50'
                            }`;

                        const stickyRightClass = `p-4 text-right sticky right-0 z-20 shadow-[-2px_0_5px_-2px_rgba(0,0,0,0.05)] border-l border-transparent transition-colors ${hasOpenQuery ? 'bg-red-50 group-hover:bg-red-100' : 'bg-white group-hover:bg-slate-50'
                            }`;

                        return (
                            <tr
                                key={item.id}
                                className={`${rowBaseClass} ${rowColorClass}`}
                            >
                                <td className={stickyLeftClass}>
                                    <div className="flex items-center gap-2">
                                        {hasOpenQuery && (
                                            <div className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                            </div>
                                        )}
                                        <button
                                            onClick={() => onView(item.id)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-semibold transition-colors cursor-pointer"
                                        >
                                            {item.fileNumber}
                                        </button>
                                    </div>
                                    {hasOpenQuery && <span className="text-[10px] text-red-500 font-medium block mt-0.5">Query Open</span>}
                                </td>

                                <td className="p-4 text-sm text-gray-600 whitespace-nowrap">{item.date}</td>



                                <td className="p-4 text-sm text-gray-700 font-medium">{item.company}</td>

                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900">{item.applicantName}</span>
                                    </div>
                                </td>

                                <td className="p-4 text-sm text-gray-600">{item.proposedOwner}</td>
                                <td className="p-4 text-sm text-gray-600">{item.currentOwner}</td>

                                <td className="p-4 text-sm text-gray-600">
                                    <div className="w-40 truncate" title={item.propertyAddress}>
                                        {item.propertyAddress}
                                    </div>
                                </td>

                                <td className="p-4 text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {item.branchName}
                                    </span>
                                </td>

                                <td className={stickyRightClass}>
                                    <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                        {hasPermission('view_applications') && (
                                            <button
                                                onClick={() => onPrint(item)}
                                                className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                                                title="Print Application"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </button>
                                        )}
                                        {hasPermission('view_applications') && (
                                            <button
                                                onClick={() => onView(item.id)}
                                                className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-blue-600 hover:shadow-sm border border-transparent hover:border-blue-100 transition-all cursor-pointer"
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                        )}
                                        {hasPermission('edit_applications') && (
                                            <button
                                                onClick={() => onEdit(item.id)}
                                                className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-indigo-600 hover:shadow-sm border border-transparent hover:border-indigo-100 transition-all cursor-pointer"
                                                title="Edit Application"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                        )}
                                        {hasPermission('delete_applications') && (
                                            <button
                                                onClick={() => onDelete(item.id, item.fileNumber)}
                                                className="p-2 hover:bg-white rounded-full text-gray-500 hover:text-red-600 hover:shadow-sm border border-transparent hover:border-red-100 transition-all cursor-pointer"
                                                title="Delete Application"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    );
};

export const ApplicationTable = React.memo(ApplicationTableComponent);

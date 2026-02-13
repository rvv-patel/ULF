import React from 'react';
import { Search, Plus, X, FileText, Loader2 } from 'lucide-react';
import type { Branch } from '../../masters/branch/types';
import { useAuth } from '../../../context/AuthContext';

interface ApplicationFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    onAdd: () => void;
    onExport: () => void;
    isExporting: boolean;
    selectedCompany: string;
    onCompanyChange: (value: string) => void;
    companies: string[];
    branches: Branch[];
    selectedBranch: string;
    onBranchChange: (value: string) => void;
    selectedStatus: string;
    onStatusChange: (value: string) => void;
    dateFrom: string;
    onDateFromChange: (value: string) => void;
    dateTo: string;
    onDateToChange: (value: string) => void;
}

export const ApplicationFilters: React.FC<ApplicationFiltersProps> = ({
    searchTerm,
    onSearchChange,
    onAdd,
    onExport,
    isExporting,
    selectedCompany,
    onCompanyChange,
    companies = [],
    branches = [],
    selectedBranch,
    onBranchChange,
    selectedStatus,
    onStatusChange,
    dateFrom,
    onDateFromChange,
    dateTo,
    onDateToChange
}) => {
    const { hasPermission } = useAuth();
    const hasActiveFilters = selectedCompany || selectedBranch || selectedStatus || dateFrom || dateTo;

    const clearAllFilters = () => {
        onCompanyChange('');
        onBranchChange('');
        onStatusChange('');
        onDateFromChange('');
        onDateToChange('');
    };

    return (
        <div className="bg-white border-b border-gray-200">
            {/* Main Filter Bar */}
            <div className="px-6 py-4">
                {/* Row 1: Search and Action Button */}
                <div className="flex items-center justify-between gap-4 mb-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search Applicant or File No..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={onExport}
                            disabled={isExporting}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-sm font-medium hover:bg-emerald-100 active:bg-emerald-200 transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isExporting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <FileText className="h-4 w-4" />
                            )}
                            <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
                        </button>

                        {hasPermission('add_applications') && (
                            <button
                                onClick={onAdd}
                                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm hover:shadow"
                            >
                                <Plus className="h-4 w-4" strokeWidth={2.5} />
                                <span>Add New</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Row 2: Filter Controls */}
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-3 flex-wrap flex-1">
                        {/* Company Filter */}
                        <div className="relative">
                            <select
                                value={selectedCompany}
                                onChange={(e) => onCompanyChange(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 min-w-[180px]"
                            >
                                <option value="">All Companies</option>
                                {companies && companies.map((company) => (
                                    <option key={company} value={company}>
                                        {company}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Branch Filter */}
                        <div className="relative">
                            <select
                                value={selectedBranch}
                                onChange={(e) => onBranchChange(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 min-w-[180px]"
                            >
                                <option value="">All Branches</option>
                                {branches && branches.map((branch) => (
                                    <option key={branch.id} value={branch.name}>
                                        {branch.name}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="relative">
                            <select
                                value={selectedStatus}
                                onChange={(e) => onStatusChange(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-400 min-w-[160px]"
                            >
                                <option value="">All Statuses</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Query">Query</option>
                                <option value="TSRPDF">TSRPDF</option>
                                <option value="Modify">Modify</option>
                                <option value="Login">Login</option>
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => onDateFromChange(e.target.value)}
                                className="pl-4 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 w-[160px]"
                            />
                            <span className="text-gray-400 text-sm font-medium">to</span>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => onDateToChange(e.target.value)}
                                className="pl-4 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all hover:border-gray-400 w-[160px]"
                            />
                        </div>
                    </div>

                    {/* Clear Filters Button */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearAllFilters}
                            className="flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-4 w-4" />
                            <span>Clear Filters</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

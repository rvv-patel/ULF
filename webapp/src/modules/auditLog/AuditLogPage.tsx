import { useState, useEffect } from 'react';
import { ClipboardList, Search, Filter, RefreshCcw } from 'lucide-react';
import api from '../../api/axios';

interface AuditLog {
    id: number;
    userId: number;
    userName: string;
    action: string;
    module: string;
    details: string;
    timestamp: string;
    ipAddress: string;
}

export default function AuditLogPage() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [moduleFilter, setModuleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await api.get('/audit-logs', {
                params: {
                    page,
                    limit: 20,
                    search: searchTerm,
                    module: moduleFilter
                }
            });
            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [page, searchTerm, moduleFilter]);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setPage(1); // Reset to first page on search
    };

    const handleRefresh = () => {
        fetchLogs();
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ClipboardList className="text-red-600" />
                            System Audit Logs
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Monitor system activities and user actions.</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        title="Refresh Logs"
                    >
                        <RefreshCcw size={20} />
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Filters */}
                    <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search logs..."
                                    value={searchTerm}
                                    onChange={handleSearch}
                                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <select
                                    value={moduleFilter}
                                    onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }}
                                    className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                                >
                                    <option value="">All Modules</option>
                                    <option value="Auth">Auth</option>
                                    <option value="Users">Users</option>
                                    <option value="Roles">Roles</option>
                                    <option value="Applications">Applications</option>
                                    {/* Add other modules as needed */}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-200 bg-gray-50/50">
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Timestamp</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">User</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Module</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Action</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Details</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">Loading logs...</td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-gray-500">No audit logs found.</td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50/80 transition-colors text-sm">
                                            <td className="p-4 text-gray-600 font-mono text-xs">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </td>
                                            <td className="p-4">
                                                <div className="font-medium text-gray-900">{log.userName}</div>
                                            </td>
                                            <td className="p-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                                    {log.module}
                                                </span>
                                            </td>
                                            <td className="p-4 text-gray-600">{log.action}</td>
                                            <td className="p-4 text-gray-600 max-w-md truncate" title={log.details}>
                                                {log.details}
                                            </td>
                                            <td className="p-4 text-gray-500 font-mono text-xs">{log.ipAddress}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Page {page} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded bg-white text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

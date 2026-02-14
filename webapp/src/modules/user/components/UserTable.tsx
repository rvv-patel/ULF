import React from 'react';
import { Trash2, ArrowUpDown, ArrowUp, ArrowDown, LogOut, Eye } from 'lucide-react';
import type { User } from '../types';
import type { Branch } from '../../../modules/masters/branch/types';
import type { Company } from '../../../store/slices/companySlice';
import { useAuth } from '../../../context/AuthContext';

interface UserTableProps {
    users: User[];
    branches: Branch[];
    companies?: Company[];
    isLoading: boolean;
    sortConfig: { field: keyof User; direction: 'asc' | 'desc' } | null;
    onSort: (field: keyof User) => void;
    onDelete: (id: number, firstName: string, lastName: string) => void;
    onEdit: (id: number) => void;
    onAssignCompany: (user: User) => void;
    onForceLogout: (user: User) => void;
}

export const UserTable: React.FC<UserTableProps> = ({
    users,
    branches,
    // companies, // Removed from destructuring as it is no longer used
    isLoading,
    sortConfig,
    onSort,
    onDelete,
    onEdit,
    onAssignCompany,
    onForceLogout
}) => {
    const { hasPermission, user: currentUser } = useAuth();
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading users...</div>;
    }

    if (users.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white">No users found matching your filters.</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-200';
            case 'inactive': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'on_leave': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const SortIcon = ({ field }: { field: keyof User }) => {
        if (sortConfig?.field !== field) return <ArrowUpDown size={14} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp size={14} className="text-gray-600" />
            : <ArrowDown size={14} className="text-gray-600" />;
    };

    const SortableHeader = ({ field, label, align = 'left' }: { field: keyof User; label: string; align?: 'left' | 'right' }) => (
        <th
            className={`p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer group hover:bg-gray-100 transition select-none ${align === 'right' ? 'text-right' : 'text-left'}`}
            onClick={() => onSort(field)}
        >
            <div className={`flex items-center gap-2 ${align === 'right' ? 'justify-end' : ''}`}>
                {label}
                <SortIcon field={field} />
            </div>
        </th>
    );

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                        <SortableHeader field="firstName" label="Name" />
                        <SortableHeader field="role" label="Role" />

                        <SortableHeader field="status" label="Status" />
                        <SortableHeader field="email" label="Email" />
                        <SortableHeader field="phone" label="Phone" />
                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Branch</th>
                        <th className="p-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Company</th>
                        <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {users.map((user) => (
                        <tr
                            key={user.id}
                            className="hover:bg-gray-50/80 transition-colors group"
                        >
                            <td className="p-4 cursor-pointer" onClick={() => onEdit(user.id)}>
                                <div className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                    {user.firstName} {user.lastName}
                                </div>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{user.role}</td>

                            <td className="p-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                                    {user.status.replace('_', ' ').charAt(0).toUpperCase() + user.status.replace('_', ' ').slice(1)}
                                </span>
                            </td>
                            <td className="p-4 text-sm text-gray-600">{user.email}</td>
                            <td className="p-4 text-sm text-gray-600">{user.phone}</td>
                            <td className="p-4 text-sm text-gray-600">
                                {branches.find(b => b.id === user.branchId)?.name || '-'}
                            </td>
                            <td className="p-4 text-sm">
                                <div className="space-y-1">
                                    {hasPermission('assign_user_companies') ? (
                                        <button
                                            onClick={() => onAssignCompany(user)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium text-sm transition-colors"
                                        >
                                            View/Assign
                                        </button>
                                    ) : (
                                        <span className="text-gray-400 text-xs italic">
                                            {user.assignedCompanies && user.assignedCompanies.length > 0
                                                ? `${user.assignedCompanies.length} Assigned`
                                                : 'None assigned'}
                                        </span>
                                    )}
                                </div>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {hasPermission('edit_users') && (
                                        <button
                                            onClick={() => onEdit(user.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {/* Force Logout - Only for Admin and only for active users */}
                                    {currentUser?.role === 'Admin' && user.status === 'active' && currentUser.id !== user.id && (
                                        <button
                                            onClick={() => onForceLogout(user)}
                                            className="p-1.5 hover:bg-orange-50 rounded-md text-gray-500 hover:text-orange-600 transition-colors"
                                            title="Force Logout & Deactivate"
                                        >
                                            <LogOut className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission('delete_users') && (
                                        <button
                                            onClick={() => onDelete(user.id, user.firstName, user.lastName)}
                                            className="p-1.5 hover:bg-red-50 rounded-md text-gray-500 hover:text-red-600 transition-colors"
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

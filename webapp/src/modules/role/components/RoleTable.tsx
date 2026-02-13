import React from 'react';
import { Eye, Trash2 } from 'lucide-react';
import type { Role } from '../types';
import { useAuth } from '../../../context/AuthContext';

interface RoleTableProps {
    roles: Role[];
    isLoading: boolean;
    onDelete: (id: number, name: string) => void;
    onEdit: (id: number) => void;
}

export const RoleTable: React.FC<RoleTableProps> = ({
    roles,
    isLoading,
    onDelete,
    onEdit
}) => {
    const { hasPermission } = useAuth();
    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading roles...</div>;
    }

    if (roles.length === 0) {
        return <div className="p-12 text-center text-gray-500 bg-white">No roles found.</div>;
    }

    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b border-gray-200 bg-gray-50/50">
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role Name</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Users</th>
                        <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {roles.map((role) => (
                        <tr key={role.id} className="hover:bg-gray-50/80 transition-colors">
                            <td className="p-4">
                                <div className="font-medium text-gray-900">{role.name}</div>
                            </td>
                            <td className="p-4 text-sm text-gray-600 max-w-xs truncate">{role.description}</td>
                            <td className="p-4 text-sm text-gray-600">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                    {role.userCount} users
                                </span>
                            </td>
                            <td className="p-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    {hasPermission('edit_roles') && (
                                        <button
                                            onClick={() => onEdit(role.id)}
                                            className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 hover:text-blue-600 transition-colors"
                                            title="Edit"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                    )}
                                    {hasPermission('delete_roles') && (
                                        <button
                                            onClick={() => onDelete(role.id, role.name)}
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

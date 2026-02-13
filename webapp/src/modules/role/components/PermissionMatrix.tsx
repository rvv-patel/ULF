import React from 'react';
import type { Permission } from '../types';

interface PermissionMatrixProps {
    permissions: Permission[];
    selectedPermissions: string[];
    onChange: (permissions: string[]) => void;
}

export const PermissionMatrix: React.FC<PermissionMatrixProps> = ({
    permissions: availablePermissions,
    selectedPermissions,
    onChange
}) => {
    // Group permissions by module
    const permissionsByModule = availablePermissions.reduce((acc, curr) => {
        if (!acc[curr.module]) {
            acc[curr.module] = [];
        }
        acc[curr.module].push(curr);
        return acc;
    }, {} as Record<string, Permission[]>);

    // Helper to order permissions: View, Add, Edit, Delete
    const sortPermissions = (perms: Permission[]) => {
        const order = ['view', 'add', 'edit', 'delete'];
        return [...perms].sort((a, b) => {
            const idxA = order.indexOf(a.action || '');
            const idxB = order.indexOf(b.action || '');
            return idxA - idxB;
        });
    };

    const togglePermission = (permissionId: string) => {
        const hasPermission = selectedPermissions.includes(permissionId);
        const newPermissions = hasPermission
            ? selectedPermissions.filter(p => p !== permissionId)
            : [...selectedPermissions, permissionId];
        onChange(newPermissions);
    };

    const handleSelectAll = (module: string) => {
        const modulePermissions = availablePermissions.filter(p => p.module === module).map(p => p.id);
        const allSelected = modulePermissions.every(p => selectedPermissions.includes(p));

        if (allSelected) {
            onChange(selectedPermissions.filter(p => !modulePermissions.includes(p)));
        } else {
            onChange([...new Set([...selectedPermissions, ...modulePermissions])]);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">Permissions</h2>
                <p className="text-sm text-gray-500 mt-1">Configure access levels across different modules.</p>
            </div>

            <div className="divide-y divide-gray-100">
                {Object.entries(permissionsByModule).map(([module, permissions]) => (
                    <div key={module} className="p-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 text-base">{module}</h3>
                            <button
                                type="button"
                                onClick={() => handleSelectAll(module)}
                                className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 bg-blue-50 rounded hover:bg-blue-100 transition-colors"
                            >
                                Select All
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {sortPermissions(permissions).map((permission) => {
                                const isSelected = selectedPermissions.includes(permission.id);
                                return (
                                    <label
                                        key={permission.id}
                                        className={`
                                            relative flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer
                                            ${isSelected
                                                ? 'border-green-200 bg-green-50/30'
                                                : 'border-gray-200 hover:border-gray-300 hover:bg-white'
                                            }
                                        `}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => togglePermission(permission.id)}
                                            className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{permission.name}</div>
                                            <div className="text-xs text-gray-500 mt-0.5">{permission.description}</div>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addRole, updateRole, fetchRoles, fetchPermissions } from '../../store/slices/roleSlice';
import type { Role } from './types';
import { PermissionMatrix } from './components/PermissionMatrix';
import { Shield, Save, X } from 'lucide-react';

export default function RoleForm() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const roles = useAppSelector(state => state.role.items);
    const permissions = useAppSelector(state => state.role.permissions);

    const [formData, setFormData] = useState<Omit<Role, 'id' | 'userCount'>>({
        name: '',
        description: '',
        permissions: []
    });

    useEffect(() => {
        if (roles.length === 0) {
            dispatch(fetchRoles());
        }
        dispatch(fetchPermissions());
    }, [dispatch, roles.length]);

    useEffect(() => {
        if (id) {
            const role = roles.find(r => r.id === Number(id));
            if (role) {
                setFormData({
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions
                });
            }
        }
    }, [id, roles]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (id) {
                const role = roles.find(r => r.id === Number(id));
                if (role) {
                    await dispatch(updateRole({
                        ...formData,
                        id: Number(id),
                        userCount: role.userCount
                    })).unwrap();
                }
            } else {
                await dispatch(addRole({
                    ...formData,
                })).unwrap();
            }
            navigate('/roles');
        } catch (error) {
            console.error('Failed to save role:', error);
            // Optionally set error state here
        }
    };

    const handlePermissionChange = (newPermissions: string[]) => {
        setFormData(prev => ({ ...prev, permissions: newPermissions }));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 flex justify-center">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {id ? 'Edit Role' : 'Create New Role'}
                    </h1>
                    <button
                        onClick={() => navigate('/roles')}
                        className="text-sm text-gray-500 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Shield className="text-green-600 h-5 w-5" />
                            <h2 className="text-lg font-semibold text-gray-800">Role Details</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Role Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                    placeholder="e.g. Editor"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-medium text-gray-700">Description</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                    placeholder="Brief description of the role"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Permissions */}
                    <PermissionMatrix
                        permissions={permissions}
                        selectedPermissions={formData.permissions}
                        onChange={handlePermissionChange}
                    />

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/roles')}
                            className="flex items-center gap-2 px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                        >
                            <X size={18} />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm shadow-green-600/20"
                        >
                            <Save size={18} />
                            {id ? 'Update Role' : 'Create Role'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

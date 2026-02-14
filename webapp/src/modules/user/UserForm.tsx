import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addUser, updateUser, fetchUsers } from '../../store/slices/userSlice';
import { fetchRoles } from '../../store/slices/roleSlice';
import { fetchBranches } from '../../store/slices/branchSlice';
import type { User, UserStatus } from './types';
import { User as UserIcon, Mail, Briefcase, Phone, MapPin } from 'lucide-react';

export default function UserForm() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const { items: users, loading, error } = useAppSelector(state => state.user);
    const { items: roles, loading: rolesLoading } = useAppSelector(state => state.role);
    const { items: branches, loading: branchesLoading } = useAppSelector(state => state.branch);

    // Fetch users if not loaded
    useEffect(() => {
        if (users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, users.length]);

    // Always fetch roles and branches
    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchBranches());
    }, [dispatch]);

    const [formData, setFormData] = useState<Omit<User, 'id' | 'dateJoined'>>({
        firstName: '',
        middleName: '',
        lastName: '',
        email: '',
        role: '',

        status: 'active',
        phone: '',
        avatar: '',
        permissions: [],
        branchId: undefined,
        address: ''
    });

    useEffect(() => {
        if (id) {
            const user = users.find(e => e.id === Number(id));
            if (user) {
                setFormData({
                    firstName: user.firstName,
                    middleName: user.middleName || '',
                    lastName: user.lastName,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    phone: user.phone,
                    avatar: user.avatar,
                    permissions: user.permissions || [],
                    branchId: user.branchId,
                    address: user.address || ''
                });
            }
        }
    }, [id, users]);

    const handleRoleChange = (roleName: string) => {
        const selectedRole = roles.find(r => r.name === roleName);
        setFormData({
            ...formData,
            role: roleName,
            permissions: selectedRole ? [...selectedRole.permissions] : []
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (id) {
                const user = users.find(e => e.id === Number(id));
                if (user) {
                    await dispatch(updateUser({
                        ...formData,
                        id: Number(id),
                        dateJoined: user.dateJoined
                    })).unwrap();
                }
            } else {
                await dispatch(addUser({
                    ...formData,
                    // id and dateJoined are handled by backend or default, but type expects id in slice?
                    // wait, addUser thunk expects Omit<User, 'id'>, but backend assigns ID.
                    // The slice type definition needs to be careful.
                    // Actually, my addUser thunk type uses Omit<User, 'id'> correctly.
                    // So I pass formData which is Omit<User, 'id'|'dateJoined'>.
                    // dateJoined will be handled by backend if missing.
                    // Need to cast or adjust.
                } as any)).unwrap();
            }
            navigate('/users');
        } catch (err) {
            console.error('Failed to save user:', err);
            // Error is handled by slice state, can display it
        }
    };

    const handleCancel = () => {
        navigate('/users');
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 flex justify-center">
            <div className="w-full max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {id ? 'Edit User' : 'Add New User'}
                    </h1>
                    <button
                        onClick={handleCancel}
                        className="text-sm text-gray-500 hover:text-gray-900 bg-white px-3 py-1.5 rounded-lg border border-gray-200 transition"
                    >
                        Cancel
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">First Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                        placeholder="e.g. Rahul"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Middle Name</label>
                                    <input
                                        type="text"
                                        value={formData.middleName}
                                        onChange={e => setFormData({ ...formData, middleName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                        placeholder="e.g. Kumar"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Last Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                        placeholder="e.g. Sharma"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                            placeholder="e.g. rahul.sharma@example.com"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full pl-9 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                            placeholder="e.g. +91 98765 43210"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-gray-400" />
                                Address Information
                            </h2>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Full Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors resize-none placeholder:text-gray-300"
                                        placeholder="e.g. B-101, Shanti Nagar, MG Road, Bangalore, Karnataka 560001, India"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 pt-6 space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <Briefcase className="h-5 w-5 text-gray-400" />
                                Job Details
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Branch</label>
                                    <select
                                        value={formData.branchId || ''}
                                        onChange={e => setFormData({ ...formData, branchId: e.target.value ? Number(e.target.value) : undefined })}
                                        disabled={branchesLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{branchesLoading ? 'Loading branches...' : 'Select Branch'}</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Role / Job Title</label>
                                    <select
                                        required
                                        value={formData.role}
                                        onChange={e => handleRoleChange(e.target.value)}
                                        disabled={rolesLoading}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                    >
                                        <option value="">{rolesLoading ? 'Loading roles...' : 'Select Role'}</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                    {rolesLoading && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></span>
                                            Loading available roles...
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as UserStatus })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="on_leave">On Leave</option>
                                    </select>
                                </div>
                            </div>
                        </div>



                        <div className="pt-6 border-t border-gray-100 flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading} // Disable while loading
                                className={`px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium shadow-sm shadow-green-600/20 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {loading ? 'Saving...' : (id ? 'Update User' : 'Create User')}
                            </button>
                        </div>
                    </form>
                </div >
            </div >
        </div >
    );
}

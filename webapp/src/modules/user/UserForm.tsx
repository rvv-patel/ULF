import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addUser, updateUser, fetchUsers } from '../../store/slices/userSlice';
import { fetchRoles } from '../../store/slices/roleSlice';
import { fetchBranches } from '../../store/slices/branchSlice';
import type { User, UserStatus } from './types';
import { User as UserIcon, Mail, Briefcase, Phone, MapPin, AlertCircle } from 'lucide-react';

interface FormErrors {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    role?: string;
    address?: string;
    branchId?: string;
    status?: string;
}

export default function UserForm() {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { id } = useParams();
    const { items: users, loading, error: sliceError } = useAppSelector(state => state.user);
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

    const [errors, setErrors] = useState<FormErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

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

    const validateField = (name: string, value: any): string | undefined => {
        switch (name) {
            case 'firstName':
                if (!value?.trim()) return 'First Name is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'First Name should only contain letters';
                return undefined;
            case 'lastName':
                if (!value?.trim()) return 'Last Name is required';
                if (!/^[a-zA-Z\s]+$/.test(value)) return 'Last Name should only contain letters';
                return undefined;
            case 'email':
                if (!value?.trim()) return 'Email Address is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
                return undefined;
            case 'phone':
                if (!value?.trim()) return 'Phone Number is required';
                // Indian Phone format: Optional +91, then 6-9 followed by 9 digits. Allows space/hyphen after code.
                if (!/^(\+91[\-\s]?)?[6-9]\d{9}$/.test(value)) return 'Please enter a valid Indian phone number';
                return undefined;
            case 'role':
                if (!value) return 'Role is required';
                return undefined;
            case 'address':
                if (!value?.trim()) return 'Address is required';
                return undefined;
            case 'branchId':
                if (!value) return 'Branch is required';
                return undefined;
            case 'status':
                if (!value) return 'Status is required';
                return undefined;
            default:
                return undefined;
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, formData[name as keyof typeof formData]);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const getFieldError = (fieldName: keyof FormErrors) => {
        return touched[fieldName] && errors[fieldName];
    };

    const handleRoleChange = (roleName: string) => {
        const selectedRole = roles.find(r => r.name === roleName);
        setFormData({
            ...formData,
            role: roleName,
            permissions: selectedRole ? [...selectedRole.permissions] : []
        });
        if (touched.role) {
            setErrors(prev => ({ ...prev, role: undefined }));
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        let processedValue: any = value;
        if (name === 'branchId') {
            processedValue = value ? Number(value) : undefined;
        }

        setFormData(prev => ({ ...prev, [name]: processedValue }));

        // Real-time validation if already touched
        if (touched[name]) {
            const error = validateField(name, processedValue);
            setErrors(prev => ({ ...prev, [name]: error }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate all fields
        const newErrors: FormErrors = {};
        const fieldsToValidate = ['firstName', 'lastName', 'email', 'phone', 'role', 'address', 'branchId', 'status'];
        let isValid = true;

        fieldsToValidate.forEach(field => {
            const error = validateField(field, formData[field as keyof typeof formData]);
            if (error) {
                newErrors[field as keyof FormErrors] = error;
                isValid = false;
            }
        });

        // Mark all as touched
        const allTouched = fieldsToValidate.reduce((acc, curr) => ({ ...acc, [curr]: true }), {});
        setTouched(allTouched);
        setErrors(newErrors);

        if (!isValid) return;

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
                } as any)).unwrap();
            }
            navigate('/users');
        } catch (err) {
            console.error('Failed to save user:', err);
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
                    {sliceError && (
                        <div className="p-4 bg-red-50 text-red-700 border-b border-red-200">
                            {sliceError}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6" noValidate>
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                                <UserIcon className="h-5 w-5 text-gray-400" />
                                Basic Information
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">First Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-300 ${getFieldError('firstName')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                        placeholder="e.g. Rahul"
                                    />
                                    {getFieldError('firstName') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.firstName}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Middle Name <span className="text-gray-400 font-normal">(Optional)</span></label>
                                    <input
                                        type="text"
                                        name="middleName"
                                        value={formData.middleName}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-colors placeholder:text-gray-300"
                                        placeholder="e.g. Kumar"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Last Name <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-300 ${getFieldError('lastName')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                        placeholder="e.g. Sharma"
                                    />
                                    {getFieldError('lastName') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.lastName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Mail className={`absolute left-3 top-2.5 h-4 w-4 ${getFieldError('email') ? 'text-red-400' : 'text-gray-400'}`} />
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-300 ${getFieldError('email')
                                                ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                                }`}
                                            placeholder="e.g. rahul.sharma@example.com"
                                        />
                                    </div>
                                    {getFieldError('email') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.email}
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Phone Number <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Phone className={`absolute left-3 top-2.5 h-4 w-4 ${getFieldError('phone') ? 'text-red-400' : 'text-gray-400'}`} />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            className={`w-full pl-9 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors placeholder:text-gray-300 ${getFieldError('phone')
                                                ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                                : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                                }`}
                                            placeholder="e.g. +91 98765 43210"
                                        />
                                    </div>
                                    {getFieldError('phone') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.phone}
                                        </p>
                                    )}
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
                                    <label className="text-sm font-medium text-gray-700">Full Address <span className="text-red-500">*</span></label>
                                    <textarea
                                        name="address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none placeholder:text-gray-300 ${getFieldError('address')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                        placeholder="e.g. B-101, Shanti Nagar, MG Road, Bangalore, Karnataka 560001, India"
                                    />
                                    {getFieldError('address') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.address}
                                        </p>
                                    )}
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
                                    <label className="text-sm font-medium text-gray-700">Branch <span className="text-red-500">*</span></label>
                                    <select
                                        name="branchId"
                                        value={formData.branchId || ''}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        disabled={branchesLoading}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${getFieldError('branchId')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                    >
                                        <option value="">{branchesLoading ? 'Loading branches...' : 'Select Branch'}</option>
                                        {branches.map(branch => (
                                            <option key={branch.id} value={branch.id}>{branch.name}</option>
                                        ))}
                                    </select>
                                    {getFieldError('branchId') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.branchId}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Role / Job Title <span className="text-red-500">*</span></label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={e => handleRoleChange(e.target.value)}
                                        onBlur={handleBlur}
                                        disabled={rolesLoading}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed ${getFieldError('role')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                    >
                                        <option value="">{rolesLoading ? 'Loading roles...' : 'Select Role'}</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.name}>{role.name}</option>
                                        ))}
                                    </select>
                                    {getFieldError('role') && (
                                        <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                                            <AlertCircle size={12} /> {errors.role}
                                        </p>
                                    )}
                                    {rolesLoading && (
                                        <p className="text-xs text-gray-500 flex items-center gap-1">
                                            <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-green-600"></span>
                                            Loading available roles...
                                        </p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-medium text-gray-700">Status <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleChange}
                                        onBlur={handleBlur}
                                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${getFieldError('status')
                                            ? 'border-red-500 focus:ring-red-200 focus:border-red-500'
                                            : 'border-gray-300 focus:ring-green-500/20 focus:border-green-500'
                                            }`}
                                    >
                                        <option value="">Select Status</option>
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

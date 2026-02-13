import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, Lock, Save, Camera, Mail, Phone, UserCircle, Shield, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

export default function ProfilePage() {
    const { user, login, token } = useAuth();
    const [activeTab, setActiveTab] = useState<'details' | 'password'>('details');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile Form State
    const [profileData, setProfileData] = useState({
        firstName: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        address: ''
    });

    // Password Form State
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: (user as any).firstName || '',
                middleName: (user as any).middleName || '',
                lastName: (user as any).lastName || '',
                phone: (user as any).phone || '',
                email: user.email || '',
                address: (user as any).address || ''
            });
        }
    }, [user]);

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        try {
            const response = await api.put('/auth/profile', profileData);
            // Update local user state via login function (re-saving token and new user data)
            if (token) {
                // Ensure permissions are preserved if backend doesn't return them in the simplified response,
                // but usually backend response should contain full user or we merge.
                // Our backend controller returns `userResponse` which has permissions.
                login(token, { ...user, ...response.data.user });
            }
            setMessage({ type: 'success', text: 'Profile updated successfully' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setIsLoading(true);

        try {
            await api.put('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your account settings and preferences</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Sidebar Tabs */}
                    <div className="md:col-span-1 space-y-2">
                        <button
                            onClick={() => setActiveTab('details')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'details'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                }`}
                        >
                            <UserCircle size={18} />
                            Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab('password')}
                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'password'
                                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                                : 'bg-white text-gray-600 hover:bg-gray-50 border border-transparent hover:border-gray-200'
                                }`}
                        >
                            <Shield size={18} />
                            Security
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="md:col-span-3">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            {message && (
                                <div className={`p-4 flex items-center gap-3 border-b ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
                                    }`}>
                                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                                    <p className="text-sm font-medium">{message.text}</p>
                                </div>
                            )}

                            <div className="p-6 md:p-8">
                                {activeTab === 'details' ? (
                                    <form onSubmit={handleProfileSubmit}>
                                        <div className="flex items-center gap-6 mb-8">
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-full bg-blue-50 border-4 border-white shadow-lg flex items-center justify-center text-blue-600 overflow-hidden">
                                                    {(user as any)?.avatar ? (
                                                        <img src={(user as any).avatar} alt="Profile" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <User size={40} />
                                                    )}
                                                </div>
                                                <button type="button" className="absolute bottom-0 right-0 p-2 bg-white rounded-full border border-gray-200 shadow-sm text-gray-500 hover:text-blue-600 transition-colors">
                                                    <Camera size={14} />
                                                </button>
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                                                <p className="text-sm text-gray-500 capitalize">{user?.role} Account</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">First Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.firstName}
                                                    onChange={e => setProfileData({ ...profileData, firstName: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Middle Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.middleName}
                                                    onChange={e => setProfileData({ ...profileData, middleName: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Last Name</label>
                                                <input
                                                    type="text"
                                                    value={profileData.lastName}
                                                    onChange={e => setProfileData({ ...profileData, lastName: e.target.value })}
                                                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="email"
                                                        value={profileData.email}
                                                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="text"
                                                        value={profileData.phone}
                                                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="border-t border-gray-100 pt-6 mb-8">
                                            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                <MapPin className="h-4 w-4 text-blue-600" />
                                                Address Information
                                            </h3>
                                            <div className="grid grid-cols-1 gap-4 mb-4">
                                                <div className="space-y-2">
                                                    <label className="text-sm font-medium text-gray-700">Full Address</label>
                                                    <textarea
                                                        rows={3}
                                                        value={profileData.address}
                                                        onChange={e => setProfileData({ ...profileData, address: e.target.value })}
                                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                                                        placeholder="A-89, MR Society, Pune"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-6 border-t border-gray-100">
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isLoading ? (
                                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <Save size={18} />
                                                )}
                                                Save Changes
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handlePasswordSubmit}>
                                        <div className="mb-6">
                                            <h3 className="text-lg font-bold text-gray-900 mb-1">Change Password</h3>
                                            <p className="text-sm text-gray-500">Ensure your account is using a long, random password to stay secure.</p>
                                        </div>

                                        <div className="space-y-6 max-w-lg">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Current Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                                <p className="text-xs text-gray-500">Minimum 8 characters with numbers and symbols</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="pt-6 border-t border-gray-100">
                                                <button
                                                    type="submit"
                                                    disabled={isLoading}
                                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isLoading ? (
                                                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    ) : (
                                                        <Save size={18} />
                                                    )}
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

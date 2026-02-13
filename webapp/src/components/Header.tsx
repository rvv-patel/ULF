import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, LogOut, ChevronDown, Bell, Cloud } from 'lucide-react';
import { useMsal } from "@azure/msal-react";
import projectLogo from '../assets/project-logo.png';

import { useAuth } from '../context/AuthContext';
import { loginRequest } from "../config/authConfig";

interface HeaderProps {
    userName?: string;
    userEmail?: string;
    userAvatar?: string;
}

export default function Header({
    userName = 'Admin User',
    userEmail = 'admin@company.com',
    userAvatar
}: HeaderProps) {
    const { instance, accounts } = useMsal();
    const oneDriveConnected = accounts.length > 0;
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isOneDriveOpen, setIsOneDriveOpen] = useState(false);

    const handleConnectOneDrive = () => {
        instance.loginRedirect(loginRequest);
    };

    const handleOneDriveLogout = () => {
        // changing from redirect to local cleanup as requested
        // instance.logoutRedirect({ ... }); 

        // 1. Clear Local Storage items relative to MSAL
        Object.keys(localStorage).forEach(key => {
            if (key.toLowerCase().includes('msal') || key.toLowerCase().includes('31f5b1d3-990d-46cb-b631-5b52d36149cb')) {
                localStorage.removeItem(key);
            }
        });

        // 2. Clear Session Storage items relative to MSAL
        Object.keys(sessionStorage).forEach(key => {
            if (key.toLowerCase().includes('msal') || key.toLowerCase().includes('31f5b1d3-990d-46cb-b631-5b52d36149cb')) {
                sessionStorage.removeItem(key);
            }
        });

        // 3. Clear Cookies (Simple approach for root path cookies)
        document.cookie.split(";").forEach((c) => {
            if (c.toLowerCase().includes('msal')) {
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            }
        });

        // 4. Hard Refresh
        window.location.reload();
    };

    return (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
            <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: App Branding */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                    >
                        <div className="flex items-center gap-2">
                            <img
                                src={projectLogo}
                                alt="Unique Legal Firm"
                                className="h-12 w-auto object-contain"
                            />
                        </div>
                    </button>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center gap-4">

                        {/* OneDrive Status Popover */}
                        <div className="relative">
                            <button
                                onClick={() => setIsOneDriveOpen(!isOneDriveOpen)}
                                className={`p-2 rounded-lg transition-colors relative flex items-center justify-center ${oneDriveConnected
                                    ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                    : 'hover:bg-gray-100 text-gray-400'
                                    }`}
                                title={oneDriveConnected ? "OneDrive Connected" : "Connect OneDrive"}
                            >
                                {/* Cloud Icon */}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M17.5 19c0-1.7-1.3-3-3-3h-1.1c-.1-1.3-.8-2.5-1.9-3.2-1.1-.8-2.5-.9-3.7-.4C6.5 13 6 14.4 6 15.9v.1C4.3 16.3 3 17.6 3 19c0 1.7 1.3 3 3 3h11.5c1.7 0 3-1.3 3-3z" />
                                </svg>

                                {/* Status Indicator Badge */}
                                <span className={`absolute top-1.5 right-1.5 h-2.5 w-2.5 border-2 border-white rounded-full ${oneDriveConnected ? 'bg-green-500' : 'bg-gray-300'
                                    }`}></span>
                            </button>

                            {/* OneDrive Menu */}
                            {isOneDriveOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsOneDriveOpen(false)}
                                    ></div>
                                    <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-3 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        <div className="px-4 pb-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">OneDrive Integration</p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {oneDriveConnected
                                                    ? 'Connected to Microsoft OneDrive'
                                                    : 'Not connected. Connect to sync files automatically.'}
                                            </p>
                                        </div>

                                        <div className="p-2">
                                            {oneDriveConnected ? (
                                                <button
                                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    onClick={() => {
                                                        setIsOneDriveOpen(false);
                                                        handleOneDriveLogout();
                                                    }}
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    <span>Disconnect OneDrive</span>
                                                </button>

                                            ) : (
                                                <button
                                                    onClick={handleConnectOneDrive}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                                                >
                                                    <Cloud className="h-4 w-4" />
                                                    Connect OneDrive
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Notifications */}
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative text-gray-600 hover:text-gray-900">
                            <Bell className="h-5 w-5" />
                            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>

                        {/* User Profile Dropdown */}
                        <div className="relative">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="flex items-center gap-3 pl-3 pr-2 py-2 hover:bg-gray-50 rounded-lg transition-all group"
                            >
                                {/* User Info */}
                                <div className="text-right hidden md:block">
                                    <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                    <p className="text-xs text-gray-500">{userEmail}</p>
                                </div>

                                {/* Avatar */}
                                <div className="relative">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt={userName}
                                            className="h-10 w-10 rounded-full object-cover border-2 border-gray-200"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                            <span className="text-white font-semibold text-sm">
                                                {userName.split(' ').map(n => n[0]).join('').toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                    <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"></span>
                                </div>

                                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isDropdownOpen && (
                                <>
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsDropdownOpen(false)}
                                    ></div>

                                    {/* Menu */}
                                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {/* User Info Header */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-semibold text-gray-900">{userName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{userEmail}</p>
                                        </div>

                                        {/* Menu Items */}
                                        <div className="py-2">
                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/profile');
                                                }}
                                            >
                                                <User className="h-4 w-4 text-gray-400" />
                                                <span>My Profile</span>
                                            </button>

                                            <button
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                onClick={() => {
                                                    setIsDropdownOpen(false);
                                                    navigate('/settings');
                                                }}
                                            >
                                                <Settings className="h-4 w-4 text-gray-400" />
                                                <span>Settings</span>
                                            </button>
                                        </div>

                                        {/* Logout */}
                                        <div className="border-t border-gray-100 pt-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header >
    );
}

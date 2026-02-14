
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Header from './Header';
import { LayoutList, Users, ShieldCheck, FileText, Building2, Store, FileCheck, FolderCheck, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, hasPermission } = useAuth();

    const isUserActive = location.pathname.startsWith('/users');
    const isRoleActive = location.pathname.startsWith('/roles');
    const isApplicationActive = location.pathname.startsWith('/application');
    const isDashboardActive = location.pathname === '/';
    const isBranchActive = location.pathname.startsWith('/masters/branches');
    const isCompanyActive = location.pathname.startsWith('/masters/company');
    const isApplicationDocumentActive = location.pathname.startsWith('/masters/application-documents');
    const isCompanyDocumentActive = location.pathname.startsWith('/masters/company-documents');
    const isFilesActive = location.pathname.startsWith('/files');

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <Header
                userName={user?.firstName || user?.username || 'User'}
                userEmail={user?.email || 'user@example.com'}
            />

            {/* Sidebar / Navigation (Simplified) */}
            <div className="fixed left-0 top-16 h-[calc(100%-4rem)] w-16 bg-white border-r border-gray-200 flex flex-col items-center py-6 z-10 hidden md:flex">
                <nav className="flex flex-col items-center gap-4 w-full">
                    <button
                        onClick={() => navigate('/')}
                        className={`p-3 rounded-xl transition-all ${isDashboardActive
                            ? 'bg-blue-50 text-blue-600 shadow-sm'
                            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                            }`}
                        title="Dashboard"
                    >
                        <LayoutList className="h-6 w-6" />
                    </button>

                    {hasPermission('view_files') && (
                        <button
                            onClick={() => navigate('/files')}
                            className={`p-3 rounded-xl transition-all ${isFilesActive
                                ? 'bg-blue-50 text-blue-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="OneDrive Files"
                        >
                            <Cloud className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_users') && (
                        <button
                            onClick={() => navigate('/users')}
                            className={`p-3 rounded-xl transition-all ${isUserActive
                                ? 'bg-purple-50 text-purple-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Users"
                        >
                            <Users className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_roles') && (
                        <button
                            onClick={() => navigate('/roles')}
                            className={`p-3 rounded-xl transition-all ${isRoleActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Roles"
                        >
                            <ShieldCheck className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_applications') && (
                        <button
                            onClick={() => navigate('/application')}
                            className={`p-3 rounded-xl transition-all ${isApplicationActive
                                ? 'bg-indigo-50 text-indigo-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Application"
                        >
                            <FileText className="h-6 w-6" />
                        </button>
                    )}

                    <div className="w-8 h-px bg-gray-100 my-2"></div>

                    {hasPermission('view_companies') && (
                        <button
                            onClick={() => navigate('/masters/company')}
                            className={`p-3 rounded-xl transition-all ${isCompanyActive
                                ? 'bg-teal-50 text-teal-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Company Master"
                        >
                            <Building2 className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_branches') && (
                        <button
                            onClick={() => navigate('/masters/branches')}
                            className={`p-3 rounded-xl transition-all ${isBranchActive
                                ? 'bg-pink-50 text-pink-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Branch Master"
                        >
                            <Store className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_application_documents') && (
                        <button
                            onClick={() => navigate('/masters/application-documents')}
                            className={`p-3 rounded-xl transition-all ${isApplicationDocumentActive
                                ? 'bg-emerald-50 text-emerald-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Application Documents"
                        >
                            <FileCheck className="h-6 w-6" />
                        </button>
                    )}

                    {hasPermission('view_company_documents') && (
                        <button
                            onClick={() => navigate('/masters/company-documents')}
                            className={`p-3 rounded-xl transition-all ${isCompanyDocumentActive
                                ? 'bg-orange-50 text-orange-600 shadow-sm'
                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                }`}
                            title="Company Documents"
                        >
                            <FolderCheck className="h-6 w-6" />
                        </button>
                    )}
                </nav>
            </div>

            {/* Main Content */}
            <div className="md:ml-16 min-h-screen bg-gray-50/50 pt-16">
                <Outlet />
            </div>
        </div>
    );
}

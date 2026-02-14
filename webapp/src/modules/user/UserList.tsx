import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { UserTable } from './components/UserTable';
import { AssignmentModal } from './components/AssignmentModal';
import ConfirmModal from '../../components/ConfirmModal';
import type { User } from './types';
import { deleteUser, fetchUsers, updateUser } from '../../store/slices/userSlice';
import { fetchBranches } from '../../store/slices/branchSlice';
import { fetchCompanies } from '../../store/slices/companySlice';
import { UserPlus, Search } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function UserList() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items: users, loading, error } = useAppSelector((state) => state.user);
    const { items: branches } = useAppSelector((state) => state.branch);
    const { items: companies } = useAppSelector((state) => state.company);
    const { hasPermission } = useAuth();

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchBranches());
        dispatch(fetchCompanies());
    }, [dispatch]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<{ field: keyof User; direction: 'asc' | 'desc' } | null>(null);

    // Assignment Modal State
    const [assignmentModal, setAssignmentModal] = useState<{
        isOpen: boolean;
        type: 'company';
        user: User | null;
    }>({ isOpen: false, type: 'company', user: null });

    // Force Logout Confirmation Modal State
    const [forceLogoutModal, setForceLogoutModal] = useState<{
        isOpen: boolean;
        user: User | null;
    }>({ isOpen: false, user: null });

    // Delete Confirmation Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        userId: number | null;
        userName: string;
    }>({ isOpen: false, userId: null, userName: '' });

    // Filter Logic
    const filteredUsers = useMemo(() => {
        let result = users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.role.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
        });

        // Sorting
        if (sortConfig) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.field] as any;
                const bValue = b[sortConfig.field] as any;

                if (aValue === null || aValue === undefined) return 1;
                if (bValue === null || bValue === undefined) return -1;
                if (aValue === bValue) return 0;

                const comparison = aValue > bValue ? 1 : -1;
                return sortConfig.direction === 'asc' ? comparison : -comparison;
            });
        }

        return result;
    }, [users, searchTerm, sortConfig]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleSort = (field: keyof User) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ field, direction });
    };

    const handleDelete = (id: number, firstName: string, lastName: string) => {
        setDeleteModal({
            isOpen: true,
            userId: id,
            userName: `${firstName} ${lastName}`
        });
    };

    const confirmDelete = async () => {
        if (deleteModal.userId) {
            try {
                await dispatch(deleteUser(deleteModal.userId)).unwrap();
                setDeleteModal({ isOpen: false, userId: null, userName: '' });
            } catch (err) {
                alert('Failed to delete user: ' + err);
                setDeleteModal({ isOpen: false, userId: null, userName: '' });
            }
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/users/${id}/edit`);
    };

    const handleAssignCompany = (user: User) => {
        setAssignmentModal({ isOpen: true, type: 'company', user });
    };

    const handleSaveAssignment = async (selectedIds: (number | string)[]) => {
        if (!assignmentModal.user) return;

        const updatedUser: User = {
            ...assignmentModal.user,
            assignedCompanies: selectedIds.map(id => Number(id))
        };

        try {
            await dispatch(updateUser(updatedUser)).unwrap();
            setAssignmentModal(prev => ({ ...prev, isOpen: false }));
        } catch (err) {
            alert('Failed to update assignments: ' + err);
        }
    };

    const handleForceLogout = (user: User) => {
        // Open custom confirmation modal
        setForceLogoutModal({ isOpen: true, user });
    };

    const confirmForceLogout = async () => {
        if (!forceLogoutModal.user) return;

        const user = forceLogoutModal.user;

        try {
            const updatedUser: User = {
                ...user,
                status: 'inactive',
                lastForcedLogoutAt: new Date().toISOString() // Add timestamp for token invalidation
            };
            await dispatch(updateUser(updatedUser)).unwrap();
            // Silent update - no success alert
            setForceLogoutModal({ isOpen: false, user: null });
        } catch (err) {
            alert('Failed to force logout user: ' + err);
            setForceLogoutModal({ isOpen: false, user: null });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-[1600px] mx-auto">
                {error && (
                    <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    <div className="p-5 border-b border-slate-100 bg-white">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <UserPlus className="h-5 w-5 text-green-600" />
                                Users
                            </h1>
                            <p className="text-slate-500 text-xs mt-1">Manage team members and their permissions</p>
                        </div>

                        {/* Search and Add Button */}
                        <div className="flex items-center gap-3">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search by name, email, or role..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all text-sm placeholder:text-slate-400"
                                />
                            </div>
                            {hasPermission('add_users') && (
                                <button
                                    onClick={() => navigate('/users/new')}
                                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm shadow-green-600/20 whitespace-nowrap"
                                >
                                    <UserPlus size={18} />
                                    Add User
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Section */}
                    <div className="p-0">
                        <UserTable
                            users={filteredUsers}
                            isLoading={loading}
                            branches={branches}
                            companies={companies}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onAssignCompany={handleAssignCompany}
                            onForceLogout={handleForceLogout}
                        />
                    </div>

                    {/* Footer */}
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4">
                        <p className="text-sm text-slate-500 text-center">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                    </div>
                </div>
            </div>

            {/* Assignment Modal */}
            <AssignmentModal
                isOpen={assignmentModal.isOpen}
                title="Assign Company"
                items={companies}
                selectedIds={
                    assignmentModal.user
                        ? (assignmentModal.user.assignedCompanies || [])
                        : []
                }
                onClose={() => setAssignmentModal(prev => ({ ...prev, isOpen: false }))}
                onSave={handleSaveAssignment}
            />

            {/* Force Logout Confirmation Modal */}
            <ConfirmModal
                isOpen={forceLogoutModal.isOpen}
                title="Force Logout User"
                message={`Are you sure you want to force logout ${forceLogoutModal.user?.firstName} ${forceLogoutModal.user?.lastName}? This will immediately terminate their session and deactivate their account.`}
                confirmText="Force Logout"
                cancelText="Cancel"
                type="warning"
                onConfirm={confirmForceLogout}
                onCancel={() => setForceLogoutModal({ isOpen: false, user: null })}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete User"
                message={`Are you sure you want to delete "${deleteModal.userName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
            />
        </div>
    );
}

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { RoleTable } from './components/RoleTable';
import { deleteRole, fetchRoles } from '../../store/slices/roleSlice';
import { fetchUsers } from '../../store/slices/userSlice';
import { ShieldCheck, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import ConfirmModal from '../../components/ConfirmModal';
import UserListModal from './components/UserListModal';
import type { User } from '../../context/AuthContext';

export default function RoleList() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const roles = useAppSelector((state) => state.role.items);
    const users = useAppSelector((state) => state.user.items);
    const { hasPermission } = useAuth();

    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        roleId: number | null;
        roleName: string;
    }>({ isOpen: false, roleId: null, roleName: '' });

    const [userModal, setUserModal] = useState<{
        isOpen: boolean;
        roleName: string;
        users: User[];
    }>({ isOpen: false, roleName: '', users: [] });

    useEffect(() => {
        dispatch(fetchRoles());
        dispatch(fetchUsers());
    }, [dispatch]);

    const rolesWithCount = roles.map(role => ({
        ...role,
        userCount: role.userCount // Use backend provided count
    }));

    const handleUserClick = (roleName: string) => {
        const roleUsers = users.filter(user => user.role === roleName);
        setUserModal({
            isOpen: true,
            roleName: roleName,
            users: roleUsers as unknown as User[] // Type casting if needed due to potential mismatch in User type definition
        });
    };

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({
            isOpen: true,
            roleId: id,
            roleName: name
        });
    };

    const confirmDelete = async () => {
        if (deleteModal.roleId) {
            await dispatch(deleteRole(deleteModal.roleId));
            setDeleteModal({ isOpen: false, roleId: null, roleName: '' });
        }
    };

    const handleEdit = (id: number) => {
        navigate(`/roles/${id}/edit`);
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <ShieldCheck className="text-green-600" />
                            Roles & Permissions
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">Manage user roles and access levels.</p>
                    </div>
                    {hasPermission('add_roles') && (
                        <button
                            onClick={() => navigate('/roles/new')}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors font-medium shadow-sm shadow-green-600/20"
                        >
                            <Plus size={18} />
                            Add Role
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-6">
                    <RoleTable
                        roles={rolesWithCount}
                        isLoading={false}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        onUserClick={handleUserClick}
                    />
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Role"
                message={`Are you sure you want to delete the role "${deleteModal.roleName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, roleId: null, roleName: '' })}
            />

            {/* User List Modal */}
            <UserListModal
                isOpen={userModal.isOpen}
                onClose={() => setUserModal({ isOpen: false, roleName: '', users: [] })}
                users={userModal.users}
                roleName={userModal.roleName}
            />
        </div>
    );
}

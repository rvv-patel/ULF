import { X, User as UserIcon } from 'lucide-react';
import type { User } from '../../../context/AuthContext';

interface UserListModalProps {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
    roleName: string;
}

export default function UserListModal({ isOpen, onClose, users, roleName }: UserListModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            {roleName} Users
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {users.length} {users.length === 1 ? 'user' : 'users'} assigned to this role
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-0 max-h-[60vh] overflow-y-auto">
                    {users.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {users.map((user) => (
                                <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-sm">
                                            {(user as any).firstName?.[0] || user.username[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">
                                                {(user as any).firstName} {(user as any).lastName}
                                            </p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${(user as any).status === 'active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {(user as any).status || 'Active'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            <p>No users found for this role.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, User, Store } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchBranches, deleteBranch } from '../../../store/slices/branchSlice';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/ConfirmModal';

export default function BranchListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items: branches, loading } = useAppSelector((state) => state.branch);
    const [searchTerm, setSearchTerm] = useState('');
    const { hasPermission } = useAuth();

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; branchId: number | null; branchName: string }>(
        { isOpen: false, branchId: null, branchName: '' }
    );

    useEffect(() => {
        dispatch(fetchBranches());
    }, [dispatch]);

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, branchId: id, branchName: name });
    };

    const confirmDelete = async () => {
        if (deleteModal.branchId) {
            await dispatch(deleteBranch(deleteModal.branchId));
            setDeleteModal({ isOpen: false, branchId: null, branchName: '' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-[1600px] mx-auto">
                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Header */}
                    <div className="p-5 border-b border-slate-100 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Store className="h-5 w-5 text-blue-600" />
                                    Branch Management
                                </h1>
                                <p className="text-slate-500 text-xs mt-1">Manage all your company branches</p>
                            </div>
                            {hasPermission('add_branches') && (
                                <button
                                    onClick={() => navigate('/masters/branches/new')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Branch
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search branches by name, contact person, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        {loading ? (
                            <div className="text-center py-12 text-slate-500">Loading branches...</div>
                        ) : filteredBranches.length === 0 ? (
                            <div className="text-center py-12">
                                <Store className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-medium text-slate-900">No branches found</h3>
                                <p className="text-slate-500 mt-1">Get started by creating your first branch.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {filteredBranches.map((branch) => (
                                    <div key={branch.id} className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                                        {/* Image Area */}
                                        <div className="h-48 bg-slate-100 rounded-t-xl overflow-hidden relative border-b border-slate-100 group-hover:opacity-90 transition-opacity">
                                            {branch.image ? (
                                                <img
                                                    src={branch.image}
                                                    alt={branch.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                                    }}
                                                />
                                            ) : null}

                                            {/* Fallback / Placeholder */}
                                            <div className={`absolute inset-0 flex flex-col items-center justify-center bg-slate-50 text-slate-400 ${branch.image ? 'hidden' : ''}`}>
                                                <Store size={48} className="opacity-20 mb-2" />
                                                <span className="text-xs font-semibold uppercase tracking-wider opacity-60">No Image Available</span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-5 flex-1 flex flex-col">
                                            <h3 className="text-xl font-bold text-slate-900 mb-4 uppercase tracking-tight">{branch.name}</h3>

                                            <div className="space-y-3 mb-6 flex-1">
                                                <div className="flex items-start gap-3 text-slate-600">
                                                    <User size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span className="text-sm font-medium uppercase text-slate-500">{branch.contactPerson}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-slate-600">
                                                    <Phone size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span className="text-sm font-medium">{branch.contactNumber}</span>
                                                </div>
                                                <div className="flex items-start gap-3 text-slate-600">
                                                    <MapPin size={18} className="mt-0.5 text-slate-400 shrink-0" />
                                                    <span className="text-sm text-slate-600 leading-snug">{branch.address}</span>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-slate-100">
                                                {hasPermission('edit_branches') && (
                                                    <button
                                                        onClick={() => navigate(`/masters/branches/${branch.id}/edit`)}
                                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition text-sm font-medium"
                                                    >
                                                        <Edit2 size={16} />
                                                        Edit
                                                    </button>
                                                )}
                                                {hasPermission('delete_branches') && (
                                                    <button
                                                        onClick={() => handleDelete(branch.id, branch.name)}
                                                        className="flex items-center justify-center gap-2 py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                                                    >
                                                        <Trash2 size={16} />
                                                        Remove
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Branch"
                message={`Are you sure you want to delete "${deleteModal.branchName}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, branchId: null, branchName: '' })}
            />
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../../store/hooks';
import { ApplicationDocumentTable } from './components/ApplicationDocumentTable';
import ApplicationDocumentModal from './components/ApplicationDocumentModal';
import { fetchApplicationDocuments, deleteApplicationDocument, addApplicationDocument, updateApplicationDocument } from '../../../store/slices/applicationDocumentSlice';
import type { ApplicationDocument } from './types';
import { Search, Plus, FileText, X } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/ConfirmModal';

export default function ApplicationDocumentListPage() {
    const dispatch = useAppDispatch();
    const { items, totalItems, totalPages, isLoading } = useAppSelector((state) => state.applicationDocument);
    const { hasPermission } = useAuth();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ field: keyof ApplicationDocument; direction: 'asc' | 'desc' } | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; docId: number | null; docTitle: string }>(
        { isOpen: false, docId: null, docTitle: '' }
    );

    // Modal state
    const [documentModal, setDocumentModal] = useState<{ isOpen: boolean; editData: ApplicationDocument | null }>({
        isOpen: false,
        editData: null
    });

    const itemsPerPage = 10;

    // Fetch data when params change
    useEffect(() => {
        dispatch(fetchApplicationDocuments({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            sortBy: sortConfig?.field,
            order: sortConfig?.direction
        }));
    }, [dispatch, currentPage, searchTerm, sortConfig]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSort = (field: keyof ApplicationDocument) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.field === field && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ field, direction });
    };

    const handleDelete = (id: number, title: string) => {
        setDeleteModal({ isOpen: true, docId: id, docTitle: title });
    };

    const confirmDelete = async () => {
        if (deleteModal.docId) {
            await dispatch(deleteApplicationDocument(deleteModal.docId));
            setDeleteModal({ isOpen: false, docId: null, docTitle: '' });
        }
    };

    const handleEdit = (id: number) => {
        const doc = items.find(item => item.id === id);
        if (doc) {
            setDocumentModal({ isOpen: true, editData: doc });
        }
    };

    const handleAddNew = () => {
        setDocumentModal({ isOpen: true, editData: null });
    };

    const handleSaveDocument = async (data: Partial<ApplicationDocument>) => {
        try {
            if (documentModal.editData) {
                // Update existing
                await dispatch(updateApplicationDocument({
                    ...documentModal.editData,
                    ...data
                } as ApplicationDocument)).unwrap();
            } else {
                // Create new
                await dispatch(addApplicationDocument({
                    title: data.title || '',
                    documentFormat: 'PDF'
                })).unwrap();
            }
            setDocumentModal({ isOpen: false, editData: null });
        } catch (error) {
            console.error('Failed to save document:', error);
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
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    Application Documents
                                </h1>
                                <p className="text-slate-500 text-xs mt-1">Manage your document templates and formats</p>
                            </div>
                            {hasPermission('add_application_documents') && (
                                <button
                                    onClick={handleAddNew}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    New Document
                                </button>
                            )}
                        </div>

                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search documents by title or format..."
                                value={searchTerm}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                            />
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Table Container with Glass Effect */}
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                        <ApplicationDocumentTable
                            items={items}
                            isLoading={isLoading}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                        />

                        {/* Enhanced Pagination */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gradient-to-r from-gray-50/50 to-transparent backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    Showing{' '}
                                    <span className="font-semibold text-gray-900">
                                        {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
                                    </span>
                                    {' '}-{' '}
                                    <span className="font-semibold text-gray-900">
                                        {Math.min(currentPage * itemsPerPage, totalItems)}
                                    </span>
                                    {' '}of{' '}
                                    <span className="font-semibold text-gray-900">{totalItems}</span>
                                    {' '}results
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
                                    >
                                        Previous
                                    </button>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                                        <span className="text-sm font-semibold text-blue-700">
                                            Page {currentPage}
                                        </span>
                                        <span className="text-sm text-gray-400">/</span>
                                        <span className="text-sm text-gray-600">
                                            {totalPages || 1}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages || totalPages === 0}
                                        className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all duration-200"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Document Modal */}
            <ApplicationDocumentModal
                isOpen={documentModal.isOpen}
                onClose={() => setDocumentModal({ isOpen: false, editData: null })}
                onSave={handleSaveDocument}
                editData={documentModal.editData}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Application Document"
                message={`Are you sure you want to delete "${deleteModal.docTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, docId: null, docTitle: '' })}
            />
        </div>
    );
}

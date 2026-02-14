import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchCompanies, deleteCompany } from '../../../store/slices/companySlice';
import { fetchCompanyDocuments, generateCompanyDocument } from '../../../store/slices/companyDocumentSlice';
import { Plus, Edit2, Trash2, Building2, MoreVertical } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import ConfirmModal from '../../../components/ConfirmModal';
import { useMsal } from "@azure/msal-react";
import { InteractionStatus } from "@azure/msal-browser";
import { loginRequest } from "../../../config/authConfig";
import axios from "axios";

// Basic Toast Component
const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium animate-in slide-in-from-top-5 fade-in duration-300 z-50 flex items-center gap-2 ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'success' ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
            ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            )}
            {message}
        </div>
    );
};

export default function CompanyListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, isLoading } = useAppSelector((state) => state.company);
    const { items: companyDocuments } = useAppSelector((state) => state.companyDocument);
    const { hasPermission } = useAuth();
    const { instance, accounts, inProgress } = useMsal();

    // Unified Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        isOpen: boolean;
        type: 'company' | 'document';
        id: string | number | null;
        name: string
    }>({
        isOpen: false,
        type: 'company',
        id: null,
        name: ''
    });

    const [openMenuId, setOpenMenuId] = useState<number | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    useEffect(() => {
        dispatch(fetchCompanies());
        dispatch(fetchCompanyDocuments({ limit: 100 }));
    }, [dispatch]);

    useEffect(() => {
        const handleClickOutside = () => setOpenMenuId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const showToast = (message: string, type: 'success' | 'error' = 'success') => {
        setToast({ message, type });
    };

    const handleDeleteCompany = (id: number, name: string) => {
        setDeleteModal({ isOpen: true, type: 'company', id, name });
    };

    const handleDeleteDocument = (id: string, name: string) => {
        setDeleteModal({ isOpen: true, type: 'document', id, name });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        try {
            if (deleteModal.type === 'company') {
                await dispatch(deleteCompany(deleteModal.id as number));
                showToast('Company deleted successfully', 'success');
            } else {
                // Document Deletion Logic
                if (accounts.length === 0) {
                    showToast('Please connect OneDrive first.', 'error');
                    return;
                }

                const request = { ...loginRequest, account: accounts[0] };
                const response = await instance.acquireTokenSilent(request);

                await axios.delete(`http://localhost:3001/api/onedrive/files/${encodeURIComponent(deleteModal.id as string)}`, {
                    headers: { Authorization: `Bearer ${response.accessToken}` }
                });
                showToast('Document deleted successfully', 'success');
                dispatch(fetchCompanies()); // Refresh list to update UI
                setOpenMenuId(null);
            }
        } catch (error: any) {
            showToast(`Delete Failed: ${error.message}`, 'error');
        } finally {
            setDeleteModal({ isOpen: false, type: 'company', id: null, name: '' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-[1600px] mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
                    <div className="p-5 border-b border-slate-100 bg-white rounded-t-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                    <Building2 className="h-5 w-5 text-blue-600" />
                                    Company Master
                                </h1>
                                <p className="text-slate-500 text-xs mt-1">Manage companies and email configurations</p>
                            </div>
                            {hasPermission('add_companies') && (
                                <button
                                    onClick={() => navigate('/masters/company/new')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add Company
                                </button>
                            )}
                        </div>
                    </div>

                    <div>
                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading companies...</div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-gray-200 bg-gray-50/50">
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Company Name</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                                        <th className="p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Configured Emails</th>
                                        <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.length === 0 ? (
                                        <tr>
                                            <td colSpan={3} className="p-8 text-center text-gray-500">
                                                No companies found. Create one to get started.
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((company) => (
                                            <tr key={company.id} className="hover:bg-gray-50/80 transition-colors group">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                                                            <Building2 size={16} />
                                                        </div>
                                                        <span className="text-sm font-medium text-gray-900">{company.name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 group/address relative">
                                                    <span
                                                        className="text-sm text-gray-600 truncate block max-w-[250px] cursor-help"
                                                        title={company.address || ''}
                                                    >
                                                        {company.address || '-'}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-wrap gap-2">
                                                        {company.emails && company.emails.length > 0 ? (
                                                            company.emails.map((email, idx) => (
                                                                <span key={idx} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                                                    {email}
                                                                </span>
                                                            ))
                                                        ) : (
                                                            <span className="text-xs text-gray-400 italic">No emails configured</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2 text-gray-400 group-hover:text-gray-600 relative">
                                                        {hasPermission('edit_companies') && (
                                                            <button
                                                                onClick={() => navigate(`/masters/company/${company.id}/edit`)}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md hover:text-blue-600 transition-colors"
                                                                title="Edit"
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        {hasPermission('delete_companies') && (
                                                            <button
                                                                onClick={() => handleDeleteCompany(company.id, company.name)}
                                                                className="p-1.5 hover:bg-red-50 rounded-md hover:text-red-600 transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}

                                                        <div className="relative">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(openMenuId === company.id ? null : company.id);
                                                                }}
                                                                className="p-1.5 hover:bg-gray-100 rounded-md hover:text-gray-800 transition-colors"
                                                                title="More actions"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </button>

                                                            {openMenuId === company.id && (
                                                                <CompanyDocumentMenu
                                                                    company={company}
                                                                    documents={companyDocuments}
                                                                    instance={instance}
                                                                    accounts={accounts}
                                                                    onClose={() => setOpenMenuId(null)}
                                                                    onSuccess={(msg: string) => {
                                                                        showToast(msg, 'success');
                                                                        dispatch(fetchCompanies());
                                                                    }}
                                                                    onError={(msg: string) => showToast(msg, 'error')}
                                                                    onDeleteDocument={handleDeleteDocument}
                                                                />
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>

                <ConfirmModal
                    isOpen={deleteModal.isOpen}
                    title={deleteModal.type === 'company' ? "Delete Company" : "Delete Document"}
                    message={`Are you sure you want to delete "${deleteModal.name}"? This action cannot be undone.`}
                    confirmText="Delete"
                    cancelText="Cancel"
                    type="danger"
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteModal({ isOpen: false, type: 'company', id: null, name: '' })}
                />

                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
}

function CompanyDocumentMenu({ company, documents, instance, accounts, onClose, onSuccess, onError, onDeleteDocument }: any) {
    const [creatingDoc, setCreatingDoc] = useState<string | null>(null);
    const { inProgress } = useMsal();
    const { user } = useAuth();

    // Use local DB data directly
    const existingFiles = company.documents || [];

    const handleCreate = async (docTitle: string) => {
        try {
            if (inProgress !== InteractionStatus.None) return;

            if (accounts.length === 0) {
                if (onError) onError('Please connect OneDrive first.');
                else alert('Please connect OneDrive first.');
                return;
            }

            setCreatingDoc(docTitle);

            const request = { ...loginRequest, account: accounts[0] };
            const response = await instance.acquireTokenSilent(request);

            const createdBy = user ? `${user.firstName} ${user.lastName}`.trim() || user.username : 'Unknown User';

            await axios.post('http://localhost:3001/api/onedrive/create-company-document',
                {
                    companyName: company.name,
                    docType: docTitle,
                    createdBy: createdBy
                },
                { headers: { Authorization: `Bearer ${response.accessToken}` } }
            );

            if (onSuccess) onSuccess(`Document ${docTitle} created successfully!`);
            onClose();
        } catch (error: any) {
            if (onError) onError(`Failed: ${error.message}`);
            else alert(`Failed: ${error.message}`);
        } finally {
            setCreatingDoc(null);
        }
    };

    const handleOpen = (webUrl: string) => {
        window.open(webUrl, '_blank');
    };

    const handleDelete = (fileId: string, fileName: string, e: React.MouseEvent) => {
        e.stopPropagation();
        onDeleteDocument(fileId, fileName);
    };

    return (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 z-50 py-1 origin-top-right animate-in fade-in zoom-in-95 duration-100"
            onClick={(e) => e.stopPropagation()}
        >
            {documents && documents.length > 0 ? (
                documents.map((doc: any) => {
                    // Check if file exists in the LOCAL company data
                    const matchedFile = existingFiles.find((f: any) =>
                        f.name.toLowerCase().includes(doc.title.toLowerCase())
                    );

                    const isCreating = creatingDoc === doc.title;

                    return (
                        <div key={doc.id} className="flex items-center justify-between hover:bg-gray-50 px-4 py-2.5 group border-b border-gray-50 last:border-0">
                            {matchedFile ? (
                                // Existing File: Click to Open
                                <button
                                    className="text-sm text-left flex-1 text-blue-600 font-medium hover:underline flex items-center gap-2"
                                    onClick={() => handleOpen(matchedFile.webUrl)}
                                    title="Open in OneDrive"
                                >
                                    {doc.title}
                                </button>
                            ) : (
                                // New File: Click to Create
                                <button
                                    className="text-sm text-left flex-1 text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-2"
                                    onClick={() => !isCreating && handleCreate(doc.title)}
                                    disabled={isCreating}
                                >
                                    {isCreating ? (
                                        <span className="flex items-center text-orange-500 text-xs">
                                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Creating...
                                        </span>
                                    ) : (
                                        doc.title
                                    )}
                                </button>
                            )}

                            {matchedFile && (
                                <button
                                    onClick={(e) => handleDelete(matchedFile.id, doc.title, e)}
                                    className="p-1.5 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded transition-colors"
                                    title="Delete from DB"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="px-4 py-3 text-xs text-gray-500 text-center">No documents available</div>
            )}
        </div>
    );
}

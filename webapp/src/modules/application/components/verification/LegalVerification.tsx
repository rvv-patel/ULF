import React, { useState, useEffect } from 'react';
import { FileText, File, AlertCircle, ChevronDown, ChevronUp, MapPin, Lock, Unlock, Trash2 } from 'lucide-react';
import { useAppDispatch } from '../../../../store/hooks';
import { updateApplication } from '../../../../store/slices/applicationSlice';
import axios from 'axios';
import { useMsal } from "@azure/msal-react";
import { useAuth } from "../../../../context/AuthContext";
import { loginRequest } from "../../../../config/authConfig";
import ConfirmModal from "../../../../components/ConfirmModal";
import Toast from "../../../../components/Toast";
import PDFUploadModal from "../../../../components/PDFUploadModal";

interface LegalVerificationProps {
    propertyAddress: string;
    companyName: string;
    applicationFileNo: string;
    generatedDocuments?: any[];
    applicationId: number;
    applicationDate?: string;
    pdfUploads?: any[]; // Uploaded PDFs from application.pdfUploads
}

export const LegalVerification: React.FC<LegalVerificationProps> = ({ propertyAddress, companyName, applicationFileNo, generatedDocuments = [], applicationId, applicationDate, pdfUploads = [] }) => {
    const dispatch = useAppDispatch();
    const { user } = useAuth(); // Extract user for role checking
    const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
        word: true,
        pdf: true,
        legal: true
    });
    const [documents, setDocuments] = useState<any[]>([]);
    const [pdfDocs, setPdfDocs] = useState<any[]>([]); // PDF documents from API
    const [loading, setLoading] = useState(false);
    const [copyingDocId, setCopyingDocId] = useState<string | null>(null);
    const { instance, accounts } = useMsal();

    useEffect(() => {
        const fetchDocuments = async () => {
            if (!companyName) return;

            setLoading(true);
            try {
                if (!accounts || accounts.length === 0) {
                    console.warn('No MSAL accounts found. User may need to sign in to OneDrive.');
                    setDocuments([]);
                    return;
                }

                const request = { ...loginRequest, account: accounts[0] };
                const response = await instance.acquireTokenSilent(request);

                const result = await axios.get(`http://localhost:3001/api/onedrive/company-documents/${encodeURIComponent(companyName)}`, {
                    headers: { Authorization: `Bearer ${response.accessToken}` }
                });
                setDocuments(result.data || []);
                console.log('Fetched documents:', result.data?.length || 0, 'docs for', companyName);
            } catch (error) {
                console.error("Failed to fetch company documents:", error);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, [companyName, accounts, instance]);

    // Fetch PDF documents from application-documents API
    useEffect(() => {
        const fetchPdfDocuments = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:3001/api/application-documents', {
                    headers: { Authorization: `Bearer ${token}` },
                    params: { limit: 100 } // Get all documents
                });

                if (response.data && response.data.items) {
                    setPdfDocs(response.data.items);
                }
            } catch (error) {
                console.error('Failed to fetch PDF documents:', error);
                setPdfDocs([]);
            }
        };

        fetchPdfDocuments();
    }, []);

    const [recentlyGenerated, setRecentlyGenerated] = useState<string[]>([]);
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
    }>({ isOpen: false, onConfirm: () => { } });
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({ show: false, message: '', type: 'success' });
    const [pdfUploadModal, setPdfUploadModal] = useState<{
        isOpen: boolean;
        pdfDoc: any | null;
    }>({ isOpen: false, pdfDoc: null });


    const isFileGenerated = (docId: string) => {
        // Check if docId matches any sourceFileId in generatedDocuments
        // OR if it's in our local recentlyGenerated list
        return generatedDocuments.some(d => d.sourceFileId === docId) || recentlyGenerated.includes(docId);
    };

    const toggleSection = (section: string) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const StatusBadge = ({ status }: { status: 'verified' | 'pending' | 'required' }) => {
        const styles = {
            verified: 'bg-green-100 text-green-700 border-green-200',
            pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
            required: 'bg-red-50 text-red-600 border-red-200'
        };
        const labels = {
            verified: 'Verified',
            pending: 'Pending Review',
            required: 'Action Required'
        };
        return (
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${styles[status]}`}>
                {labels[status]}
            </span>
        );
    };

    const handleDocumentClick = async (doc: any) => {
        if (copyingDocId) return; // Prevent double clicks

        // Confirm with user? Or just do it? User said "clicking any document... it will copy"
        // Let's add a small confirmation or at least visual feedback.
        // For now, implied action.

        try {
            if (!accounts || accounts.length === 0) {
                setToast({
                    show: true,
                    message: "Please connect to OneDrive first.",
                    type: 'error'
                });
                return;
            }

            setCopyingDocId(doc.id);
            const request = { ...loginRequest, account: accounts[0] };
            const response = await instance.acquireTokenSilent(request);

            await axios.post('http://localhost:3001/api/onedrive/copy-document', {
                fileId: doc.id,
                applicationFileNo,
                companyName,
                applicationDate // Pass application date for correct path generation
            }, {
                headers: { Authorization: `Bearer ${response.accessToken}` }
            });

            // Maybe show success toast eventually.
            console.log(`Document ${doc.name} copied successfully for application ${applicationFileNo}`);

            // Add to local generated list for immediate visual feedback
            setRecentlyGenerated(prev => [...prev, doc.id]);

            // Show success toast
            setToast({
                show: true,
                message: `${doc.name.replace(/\.docx$/i, '')} successfully generated for application ${applicationFileNo}`,
                type: 'success'
            });

        } catch (error) {
            console.error("Failed to copy document:", error);
            setToast({
                show: true,
                message: "Failed to generate document. Please try again.",
                type: 'error'
            });
        } finally {
            setCopyingDocId(null);
        }
    };

    // Helper to check if current user is admin
    const isActiveAdmin = React.useMemo(() => {
        if (!user) return false;

        // Check for Admin role or specific admin email
        const isAdminRole = user.role === 'Admin';
        const isKnownAdmin = user.email === 'ravi@gmail.com';

        return isAdminRole || isKnownAdmin;
    }, [user]);

    const handleToggleLock = async (docId: string, currentStatus: boolean, e: React.MouseEvent) => {
        e.stopPropagation();

        // Create a copy of generatedDocuments with the updated status
        const updatedDocuments = generatedDocuments.map(doc => {
            if (doc.sourceFileId === docId || doc.id === docId) {
                return { ...doc, isLocked: !currentStatus };
            }
            return doc;
        });

        // Optimistic update could be done here, but let's just dispatch
        try {
            // We need to send the ENTIRE application object or at least the part we are updating.
            // valid way for this slice: updateApplication({ id: applicationId, documents: updatedDocuments, ...otherFields })
            // The slice expects { id, ...updates }.
            await dispatch(updateApplication({
                id: applicationId,
                documents: updatedDocuments
            } as any)).unwrap();

            // alert(`Document ${currentStatus ? 'unlocked' : 'locked'} successfully.`);
        } catch (err) {
            console.error("Failed to toggle lock:", err);
            alert("Failed to update lock status.");
        }
    };

    const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Open custom confirm modal
        setConfirmModal({
            isOpen: true,
            onConfirm: async () => {
                // Close modal
                setConfirmModal({ isOpen: false, onConfirm: () => { } });

                // Remove document from generatedDocuments array
                const updatedDocuments = generatedDocuments.filter(
                    doc => doc.sourceFileId !== docId && doc.id !== docId
                );

                try {
                    await dispatch(updateApplication({
                        id: applicationId,
                        documents: updatedDocuments
                    } as any)).unwrap();

                    // Remove from local state to immediately update UI
                    setRecentlyGenerated(prev => prev.filter(id => id !== docId));

                    // Document will revert to normal state (no "Generated" badge)
                } catch (err) {
                    console.error("Failed to delete document:", err);
                    alert("Failed to delete document.");
                }
            }
        });
    };

    const handlePdfClick = (pdfDoc: any) => {
        // Check if this PDF is already uploaded
        const uploadedPdf = pdfUploads.find(p => p.title === pdfDoc.title);

        if (uploadedPdf && uploadedPdf.fileUrl) {
            // Already uploaded - open in new tab
            window.open(uploadedPdf.fileUrl, '_blank');
        } else {
            // Not uploaded - show upload modal
            if (!accounts || accounts.length === 0) {
                setToast({
                    show: true,
                    message: "Please connect to OneDrive first.",
                    type: 'error'
                });
                return;
            }
            setPdfUploadModal({ isOpen: true, pdfDoc });
        }
    };

    const handlePdfUpload = async (file: File) => {
        if (!pdfUploadModal.pdfDoc) return;

        try {
            console.log('[PDF Upload] Starting upload for:', pdfUploadModal.pdfDoc.title);
            console.log('[PDF Upload] File:', file.name, file.size, file.type);

            // Acquire MSAL token for OneDrive
            if (!accounts || accounts.length === 0) {
                console.error('[PDF Upload] No MSAL account found');
                throw new Error('Please connect to OneDrive first.');
            }

            console.log('[PDF Upload] MSAL account found:', accounts[0].username);
            const request = { ...loginRequest, account: accounts[0] };
            const msalResponse = await instance.acquireTokenSilent(request);
            console.log('[PDF Upload] MSAL token acquired successfully');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('applicationFileNo', applicationFileNo);
            formData.append('pdfTitle', pdfUploadModal.pdfDoc.title);
            formData.append('applicationId', applicationId.toString());
            if (applicationDate) {
                formData.append('applicationDate', applicationDate);
            }

            console.log('[PDF Upload] FormData created, calling API...');
            const response = await axios.post(
                'http://localhost:3001/api/onedrive/upload-pdf',
                formData,
                {
                    headers: {
                        'Authorization': `Bearer ${msalResponse.accessToken}`
                    }
                }
            );

            console.log('[PDF Upload] Response:', response.data);

            if (response.data.success) {
                console.log('[PDF Upload] Upload successful!');
                setToast({
                    show: true,
                    message: `${pdfUploadModal.pdfDoc.title} uploaded successfully to application ${applicationFileNo}`,
                    type: 'success'
                });

                // Close modal
                setPdfUploadModal({ isOpen: false, pdfDoc: null });
            } else {
                console.error('[PDF Upload] Upload failed:', response.data.error);
                throw new Error(response.data.error || 'Upload failed');
            }
        } catch (error: any) {
            console.error('[PDF Upload] Error:', error);
            console.error('[PDF Upload] Error message:', error.message);
            console.error('[PDF Upload] Error response:', error.response?.data);
            setToast({
                show: true,
                message: error.response?.data?.error || error.message || 'Failed to upload PDF. Please try again.',
                type: 'error'
            });
            throw error;
        }
    };

    const handlePdfLockToggle = async (pdfUpload: any) => {
        const action = pdfUpload.isLocked ? 'unlock' : 'lock';
        // if (!window.confirm(`Are you sure you want to ${action} "${pdfUpload.title}"?`)) return; // Optional: Remove confirm for better UX if desired, or keep it. User didn't complain about confirm.

        try {
            // Optimistic update logic using updateApplication
            // We need to update the pdfUploads array in the application object
            const updatedPdfUploads = pdfUploads.map(p => {
                if (p.id === pdfUpload.id) {
                    return { ...p, isLocked: !p.isLocked };
                }
                return p;
            });

            await dispatch(updateApplication({
                id: applicationId,
                pdfUploads: updatedPdfUploads
            } as any)).unwrap();

            setToast({
                show: true,
                message: `PDF ${action}ed successfully`,
                type: 'success'
            });

            // NO window.location.reload() here!
        } catch (error: any) {
            console.error(`Failed to ${action} PDF:`, error);
            setToast({
                show: true,
                message: "Failed to update lock status",
                type: 'error'
            });
        }
    };

    const handlePdfDelete = async (pdfUpload: any) => {
        if (!window.confirm(`Are you sure you want to delete "${pdfUpload.title}"? This will remove it from OneDrive and the database.`)) return;

        try {
            if (!accounts || accounts.length === 0) {
                setToast({
                    show: true,
                    message: "Please connect to OneDrive first.",
                    type: 'error'
                });
                return;
            }

            const request = { ...loginRequest, account: accounts[0] };
            const msalResponse = await instance.acquireTokenSilent(request);

            const response = await axios.delete(
                'http://localhost:3001/api/onedrive/delete-pdf',
                {
                    data: {
                        applicationId: applicationId.toString(),
                        pdfId: pdfUpload.id,
                        fileId: pdfUpload.fileId
                    },
                    headers: {
                        'Authorization': `Bearer ${msalResponse.accessToken}`
                    }
                }
            );

            if (response.data.success) {
                setToast({
                    show: true,
                    message: 'PDF deleted successfully',
                    type: 'success'
                });
                // Refresh page data
                window.location.reload();
            }
        } catch (error: any) {
            console.error('Failed to delete PDF:', error);
            setToast({
                show: true,
                message: error.response?.data?.error || 'Failed to delete PDF',
                type: 'error'
            });
        }
    };

    return (
        <div className="space-y-8">
            {/* Property Address Card */}
            <div className="bg-bluenew-50 rounded-lg p-1 border border-blue-100">
                <div className="bg-white rounded-md p-6 border-l-4 border-blue-500 shadow-sm">
                    <div className="flex items-start gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                            <MapPin size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Property Address</h4>
                            <p className="text-lg font-medium text-gray-900 leading-relaxed max-w-2xl">
                                {propertyAddress}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Single Column Layout */}
            <div className="space-y-8">
                {/* Documents Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-2">
                        <FileText size={20} className="text-gray-400" />
                        Verification Items
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Word Documents Group */}
                        <div className="bg-white border boundary-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div
                                className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('word')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="bg-blue-600 text-white p-1 rounded">
                                        <FileText size={14} />
                                    </div>
                                    <span className="font-semibold text-gray-700">Word Documents</span>
                                    {loading && <span className="text-xs text-blue-500 ml-2">(Loading...)</span>}
                                </div>
                                {openSections.word ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </div>

                            {openSections.word && (
                                <div className="p-2">
                                    {!loading && documents.length === 0 ? (
                                        <div className="p-4 text-center text-sm text-gray-500">
                                            No word documents found for {companyName}.
                                        </div>
                                    ) : (
                                        documents.map((doc) => {
                                            const isGenerated = isFileGenerated(doc.id);
                                            const generatedDoc = generatedDocuments.find(d => d.sourceFileId === doc.id || d.id === doc.id);
                                            const isLocked = generatedDoc?.isLocked || false;

                                            // Debug logging
                                            console.log('Document:', doc.name, {
                                                isLocked,
                                                isActiveAdmin,
                                                isGenerated,
                                                willShow: !(isLocked && !isActiveAdmin)
                                            });

                                            // If locked and NOT admin, don't show
                                            if (isLocked && !isActiveAdmin) return null;

                                            return (
                                                <div key={doc.id} className={`flex items-center justify-between p-3 rounded-lg transition-colors group border-b border-gray-100 last:border-0 border-dashed ${isGenerated ? 'bg-green-50/80 border-green-100 backdrop-blur-sm' : 'hover:bg-gray-50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`h-2 w-2 rounded-full ${isGenerated ? 'bg-green-500' : 'bg-blue-400'}`}></div>
                                                        <span
                                                            onClick={() => !isLocked && !isGenerated && handleDocumentClick(doc)}
                                                            className={`text-sm font-medium transition-colors ${isLocked || isGenerated ? 'text-gray-400 cursor-not-allowed' :
                                                                'text-gray-700 hover:text-blue-600 cursor-pointer'
                                                                } ${copyingDocId === doc.id ? 'opacity-50' : ''}`}
                                                        >
                                                            {doc.name.replace(new RegExp(`^${companyName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\s*[-_]?\\s*`, 'i'), '')}
                                                            {copyingDocId === doc.id && <span className="ml-2 text-xs text-blue-500">Preparing Document...</span>}
                                                            {isGenerated && !copyingDocId && !isLocked && <span className="ml-2 text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded border border-green-200">Generated</span>}
                                                            {isLocked && <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 flex inline-flex items-center gap-1"><Lock size={10} /> Locked</span>}
                                                        </span>
                                                    </div>

                                                    {/* Admin Actions: Lock/Unlock + Delete */}
                                                    {isActiveAdmin && isGenerated && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => handleToggleLock(doc.id, isLocked, e)}
                                                                className={`p-1.5 rounded-full transition-colors ${isLocked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                                                title={isLocked ? "Unlock Document" : "Lock Document"}
                                                            >
                                                                {isLocked ? <Lock size={14} /> : <Unlock size={14} />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDeleteDocument(doc.id, e)}
                                                                className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                title="Delete Generated Document"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}

                                </div>
                            )}
                        </div>

                        {/* PDF Documents Group */}
                        <div className="bg-white border boundary-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                            <div
                                className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                                onClick={() => toggleSection('pdf')}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-500 text-white p-1 rounded">
                                        <File size={14} />
                                    </div>
                                    <span className="font-semibold text-gray-700">PDF Documents</span>
                                </div>
                                {openSections.pdf ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                            </div>

                            {openSections.pdf && (
                                <div className="p-2">
                                    {pdfDocs.length === 0 ? (
                                        <div className="p-3 text-sm text-gray-500 text-center">
                                            No PDF documents found
                                        </div>
                                    ) : (
                                        pdfDocs.map((doc: any, idx: number) => {
                                            const uploadedPdf = pdfUploads.find(p => p.title === doc.title);
                                            const isUploaded = !!uploadedPdf;
                                            const isLocked = uploadedPdf?.isLocked || false;

                                            // STRICT FILTER: If locked and NOT admin, do not render
                                            if (isLocked && !isActiveAdmin) return null;

                                            return (
                                                <div
                                                    key={doc.id || idx}
                                                    className={`flex items-center justify-between p-3 rounded-lg transition-all group border-b border-gray-100 last:border-0 border-dashed ${isUploaded
                                                        ? 'bg-green-50/80 border-green-100 backdrop-blur-sm'
                                                        : 'hover:bg-gray-50'
                                                        }`}
                                                >
                                                    <div
                                                        className="flex items-center gap-3 flex-1 cursor-pointer"
                                                        onClick={() => handlePdfClick(doc)}
                                                    >
                                                        <div className={`h-2 w-2 rounded-full ${isUploaded ? 'bg-green-500' : 'bg-red-400'}`}></div>
                                                        <span className={`text-sm font-medium transition-colors ${isUploaded ? 'text-green-800' : 'text-gray-700 group-hover:text-red-600'
                                                            }`}>
                                                            {doc.title || `Document ${idx + 1}`}
                                                        </span>
                                                        {isUploaded && (
                                                            <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded-md">
                                                                Uploaded
                                                            </span>
                                                        )}
                                                        {isLocked && (
                                                            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 inline-flex items-center gap-1">
                                                                <Lock size={10} /> Locked
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Management buttons - Admin Only */}
                                                    {isUploaded && isActiveAdmin && (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePdfLockToggle(uploadedPdf);
                                                                }}
                                                                className={`p-1.5 rounded-full transition-colors ${isLocked ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600'}`}
                                                                title={isLocked ? "Unlock PDF" : "Lock PDF"}
                                                            >
                                                                {isLocked ? (
                                                                    <Lock size={14} />
                                                                ) : (
                                                                    <Unlock size={14} />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handlePdfDelete(uploadedPdf);
                                                                }}
                                                                className="p-1.5 rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                                                title="Delete PDF"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Legal Remarks Section - Moved here */}
                    <div className="bg-white border boundary-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                        <div
                            className="bg-gray-50 px-5 py-3 border-b border-gray-200 flex items-center justify-between cursor-pointer"
                            onClick={() => toggleSection('legal')}
                        >
                            <div className="flex items-center gap-2">
                                <div className="bg-amber-500 text-white p-1 rounded">
                                    <AlertCircle size={14} />
                                </div>
                                <span className="font-semibold text-gray-700">Legal Remarks</span>
                            </div>
                            {openSections.legal ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                        </div>

                        {openSections.legal && (
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Lawyer's Assessment</label>
                                    <span className="text-xs text-gray-400">Last updated: Today, 10:30 AM</span>
                                </div>

                                <div className="bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                                    {/* Toolbar */}
                                    <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                                        <button className="p-1 hover:bg-white rounded text-gray-500 text-xs font-bold">B</button>
                                        <button className="p-1 hover:bg-white rounded text-gray-500 text-xs italic">I</button>
                                        <button className="p-1 hover:bg-white rounded text-gray-500 text-xs underline">U</button>
                                        <div className="h-4 w-px bg-gray-300 mx-1"></div>
                                        <button className="p-1 hover:bg-white rounded text-gray-500 text-xs">List</button>
                                    </div>
                                    <textarea
                                        className="w-full p-4 text-sm text-gray-700 min-h-[150px] focus:outline-none rounded-b-lg resize-none"
                                        placeholder="Enter legal remarks or observations here..."
                                    ></textarea>
                                </div>

                                <div className="mt-4 flex justify-end gap-3">
                                    <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                        Save Draft
                                    </button>
                                    <button className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all transform active:scale-95">
                                        Submit Remark
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={confirmModal.isOpen}
                title="Delete Generated Document?"
                message="The file will remain in OneDrive but will be removed from this application. You can re-generate it later."
                confirmText="Delete"
                cancelText="Cancel"
                onConfirm={confirmModal.onConfirm}
                onCancel={() => setConfirmModal({ isOpen: false, onConfirm: () => { } })}
                type="danger"
            />

            {/* Toast Notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ show: false, message: '', type: 'success' })}
                />
            )}

            {/* PDF Upload Modal */}
            <PDFUploadModal
                isOpen={pdfUploadModal.isOpen}
                pdfTitle={pdfUploadModal.pdfDoc?.title || ''}
                onClose={() => setPdfUploadModal({ isOpen: false, pdfDoc: null })}
                onUpload={handlePdfUpload}
            />
        </div>
    );
};


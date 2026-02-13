import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchApplicationById, clearCurrentApplication, addQuery, updateQuery } from '../../store/slices/applicationSlice';
import { ArrowLeft, FileText, Calendar, Plus, Pencil, Scale, Mail, MessageSquare, Briefcase, Activity } from 'lucide-react';
import { QueryModal } from './components/QueryModal';
import { VerificationSection } from './components/verification/VerificationSection';
import { ResolveQueryModal } from './components/ResolveQueryModal';

export default function ApplicationViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { currentApplication, isLoading, error } = useAppSelector((state) => (state.application as any));

    const [activeTab, setActiveTab] = useState<'overview' | 'legal' | 'email' | 'queries'>('overview');
    const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
    const [editingQuery, setEditingQuery] = useState<any>(null);

    const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
    const [queryToResolve, setQueryToResolve] = useState<any>(null);

    useEffect(() => {
        if (id) {
            dispatch(fetchApplicationById(Number(id)));
        }
        return () => {
            dispatch(clearCurrentApplication());
        };
    }, [dispatch, id]);

    const handleSaveQuery = (queryData: any) => {
        if (editingQuery) {
            dispatch(updateQuery({
                id: Number(id),
                queryId: editingQuery.id,
                updates: queryData
            }));
        } else {
            dispatch(addQuery({
                id: Number(id),
                query: queryData
            }));
        }
        setIsQueryModalOpen(false);
        setEditingQuery(null);
    };

    const handleEditQuery = (query: any) => {
        setEditingQuery(query);
        setIsQueryModalOpen(true);
    };

    const handleResolveClick = (query: any, shouldResolve: boolean) => {
        if (shouldResolve) {
            setQueryToResolve(query);
            setIsResolveModalOpen(true);
        } else {
            // If unchecking, just unresolve immediately? Or ask confirmation?
            // Usually unresolving is simpler.
            dispatch(updateQuery({
                id: Number(id),
                queryId: query.id,
                updates: { isResolved: false }
            }));
        }
    };

    const confirmResolve = (withEmail: boolean, remark: string) => {
        if (queryToResolve) {
            dispatch(updateQuery({
                id: Number(id),
                queryId: queryToResolve.id,
                updates: {
                    isResolved: true,
                    resolvedBy: 'CurrentUser', // Ideally fetch from auth context
                    resolutionRemark: remark
                }
            }));

            if (withEmail) {
                console.log("Triggering resolution email for query:", queryToResolve.id, "Remark:", remark);
                // Implementation for email trigger would go here
            }
        }
        setIsResolveModalOpen(false);
        setQueryToResolve(null);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => navigate('/application')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                    Back to Applications
                </button>
            </div>
        );
    }

    if (!currentApplication) {
        return null;
    }

    const tabs = [
        { id: 'overview', label: 'Overview', icon: FileText },
        { id: 'legal', label: 'Legal Verification', icon: Scale },
        { id: 'email', label: 'Email Triggers', icon: Mail },
        { id: 'queries', label: 'Queries & Remarks', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50/50">
            {/* Top Navigation Bar with Back Button */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/application')}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div className="h-6 w-px bg-gray-200"></div>
                            <div className="flex items-center gap-3">
                                <span className="font-semibold text-gray-900">{currentApplication.fileNumber}</span>
                                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${currentApplication.status === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                                    currentApplication.status === 'Pending' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                                        'bg-gray-50 text-gray-700 border border-gray-200'
                                    }`}>
                                    {currentApplication.status || 'Active'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-all whitespace-nowrap ${isActive
                                        ? 'border-blue-600 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <Icon size={16} />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Overview TabContent */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Key Details Card */}
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 lg:col-span-2 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 transition-transform group-hover:scale-110 duration-700"></div>
                                <div className="relative">
                                    <h2 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
                                        <Briefcase className="text-blue-600" size={24} />
                                        Application Information
                                    </h2>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Applicant</label>
                                            <div className="text-lg font-bold text-gray-900">{currentApplication.applicantName}</div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Branch</label>
                                            <div className="text-lg font-bold text-gray-900">{currentApplication.branchName}</div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Company Details</label>
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                                <div className="text-lg font-bold text-gray-900">{currentApplication.company}</div>
                                                <span className="hidden sm:block text-gray-300">|</span>
                                                <div className="text-gray-600 font-medium">Ref: {currentApplication.companyReference}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Current Owner</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600">
                                                    {currentApplication.currentOwner ? currentApplication.currentOwner.charAt(0) : 'N'}
                                                </div>
                                                <span className="font-medium text-gray-900">{currentApplication.currentOwner || 'Not Assigned'}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Proposed Owner</label>
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {currentApplication.proposedOwner ? currentApplication.proposedOwner.charAt(0) : 'N'}
                                                </div>
                                                <span className="font-medium text-gray-900">{currentApplication.proposedOwner || 'Not Assigned'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Summary / Stats Card */}
                            <div className="space-y-6">
                                <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 shadow-lg text-white">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="font-semibold text-blue-100">Quick Stats</h3>
                                        <Activity size={20} className="text-blue-200" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div>
                                            <div className="text-3xl font-bold mb-1">{currentApplication.queries?.filter((q: any) => !q.isResolved).length || 0}</div>
                                            <div className="text-xs text-blue-200 uppercase tracking-wide opacity-80">Open Queries</div>
                                        </div>
                                        <div>
                                            <div className="text-3xl font-bold mb-1">{currentApplication.queries?.filter((q: any) => q.isResolved).length || 0}</div>
                                            <div className="text-xs text-blue-200 uppercase tracking-wide opacity-80">Resolved</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 block">Application Date</label>
                                    <div className="flex items-center gap-3 text-gray-900">
                                        <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
                                            <Calendar size={20} />
                                        </div>
                                        <span className="text-lg font-bold">{currentApplication.date}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Legal Verification Tab */}
                {activeTab === 'legal' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <VerificationSection
                            propertyAddress={currentApplication.propertyAddress || 'No property address available.'}
                            initialTab="Legal"
                            companyName={currentApplication.company}
                            applicationFileNo={currentApplication.fileNumber}
                            generatedDocuments={currentApplication.documents || []}
                            applicationId={currentApplication.id}
                            applicationDate={currentApplication.date}
                            pdfUploads={currentApplication.pdfUploads || []}
                        />
                    </div>
                )}

                {/* Email Verification Tab */}
                {activeTab === 'email' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="max-w-4xl mx-auto">
                            <VerificationSection
                                propertyAddress={currentApplication.propertyAddress || ''}
                                initialTab="Email"
                                companyName={currentApplication.company}
                                applicationFileNo={currentApplication.fileNumber}
                                generatedDocuments={currentApplication.documents || []}
                                applicationId={currentApplication.id}
                            />
                        </div>
                    </div>
                )}

                {/* Queries Tab */}
                {activeTab === 'queries' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                                <div>
                                    <h3 className="font-bold text-gray-900 text-lg">Query History</h3>
                                    <p className="text-sm text-gray-500">Track and resolve application issues</p>
                                </div>
                                <button
                                    onClick={() => { setEditingQuery(null); setIsQueryModalOpen(true); }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                                >
                                    <Plus size={18} />
                                    New Query
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {currentApplication.queries?.map((query: any) => (
                                    <div key={query.id} className="p-6 hover:bg-gray-50 transition-colors group">
                                        <div className="flex items-start gap-4">
                                            <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${query.isResolved ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between mb-2">
                                                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{query.date}</span>
                                                </div>

                                                <p className="text-gray-900 font-medium text-base mb-3 leading-relaxed">
                                                    {query.queryDetails}
                                                </p>

                                                {query.remarks && (
                                                    <div className="mb-4 pl-4 border-l-2 border-blue-100 bg-blue-50/30 p-2 rounded-md">
                                                        <span className="text-xs font-bold text-blue-400 uppercase block mb-1">Remark</span>
                                                        <p className="text-gray-700 text-sm">{query.remarks}</p>
                                                    </div>
                                                )}

                                                <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-bold text-gray-400 uppercase">Raised By</span>
                                                        <span className="font-medium text-gray-700">{query.raisedBy}</span>
                                                    </div>
                                                    {query.isResolved && (
                                                        <>
                                                            <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-bold text-gray-400 uppercase">Resolved By</span>
                                                                <span className="font-medium text-green-700">{query.resolvedBy}</span>
                                                            </div>
                                                        </>
                                                    )}
                                                    <div className="ml-auto flex items-center gap-4">
                                                        <button
                                                            onClick={() => handleEditQuery(query)}
                                                            className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-blue-600 uppercase tracking-wide transition-colors"
                                                        >
                                                            <Pencil size={14} />
                                                            Edit
                                                        </button>
                                                        <div className="w-px h-4 bg-gray-300"></div>
                                                        <label className="flex items-center gap-2 cursor-pointer select-none">
                                                            <input
                                                                type="checkbox"
                                                                checked={query.isResolved}
                                                                onChange={(e) => handleResolveClick(query, e.target.checked)}
                                                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                            />
                                                            <span className={`text-sm font-medium ${query.isResolved ? 'text-green-600' : 'text-gray-500'}`}>
                                                                {query.isResolved ? 'Resolved' : 'Mark as Resolved'}
                                                            </span>
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {(!currentApplication.queries || currentApplication.queries.length === 0) && (
                                    <div className="text-center py-16">
                                        <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <MessageSquare className="text-gray-400" size={32} />
                                        </div>
                                        <h3 className="text-gray-900 font-medium mb-1">No queries yet</h3>
                                        <p className="text-gray-500">Everything looks good so far.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <QueryModal
                isOpen={isQueryModalOpen}
                onClose={() => setIsQueryModalOpen(false)}
                onSave={handleSaveQuery}
                initialData={editingQuery}
            />

            <ResolveQueryModal
                isOpen={isResolveModalOpen}
                onClose={() => setIsResolveModalOpen(false)}
                onResolve={confirmResolve}
                query={queryToResolve}
            />
        </div>
    );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { ApplicationFilters } from './components/ApplicationFilters';
import { ApplicationTable } from './components/ApplicationTable';
import { ApplicationPagination } from './components/ApplicationPagination';
import { fetchApplications, deleteApplication } from '../../store/slices/applicationSlice';
import { fetchCompanies } from '../../store/slices/companySlice';
import { fetchBranches } from '../../store/slices/branchSlice';
import type { Application } from './types';
import { printApplication } from '../../utils/printApplication';
import { FileText } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function ApplicationListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, totalItems, totalPages, isLoading } = useAppSelector((state) => state.application);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedBranch, setSelectedBranch] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{ field: keyof Application; direction: 'asc' | 'desc' } | null>(null);

    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; appId: number | null; appTitle: string }>(
        { isOpen: false, appId: null, appTitle: '' }
    );
    const [isExporting, setIsExporting] = useState(false);

    const { items: companies } = useAppSelector((state) => state.company);
    const { items: branches } = useAppSelector((state) => state.branch);

    // Fetch data when params change
    React.useEffect(() => {
        dispatch(fetchCompanies());
        dispatch(fetchBranches());
    }, [dispatch]);

    const [itemsPerPage, setItemsPerPage] = useState(10);

    React.useEffect(() => {
        dispatch(fetchApplications({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            sortBy: sortConfig?.field,
            order: sortConfig?.direction,
            company: selectedCompany,
            branch: selectedBranch,
            status: selectedStatus,
            dateFrom: dateFrom,
            dateTo: dateTo
        }));
    }, [dispatch, currentPage, itemsPerPage, searchTerm, sortConfig, selectedCompany, selectedBranch, selectedStatus, dateFrom, dateTo]);

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleSort = React.useCallback((field: keyof Application) => {
        setSortConfig(current => {
            let direction: 'asc' | 'desc' = 'asc';
            if (current && current.field === field && current.direction === 'asc') {
                direction = 'desc';
            }
            return { field, direction };
        });
    }, []);

    const handleDelete = React.useCallback((id: number, title: string) => {
        setDeleteModal({ isOpen: true, appId: id, appTitle: title });
    }, []);

    const confirmDelete = async () => {
        if (deleteModal.appId) {
            await dispatch(deleteApplication(deleteModal.appId));
            setDeleteModal({ isOpen: false, appId: null, appTitle: '' });
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Fetch all data matching current filters
            const params = {
                page: 1,
                limit: 10000, // Large limit to get all
                search: searchTerm,
                sortBy: sortConfig?.field,
                order: sortConfig?.direction,
                company: selectedCompany,
                branch: selectedBranch,
                status: selectedStatus,
                dateFrom: dateFrom,
                dateTo: dateTo
            };

            // Re-implementing fetch logic locally for export to avoid messing with redux state
            const { default: api } = await import('../../api/axios');
            const response = await api.get('/applications', { params });
            const dataForExport = response.data.items.map((app: Application) => ({
                'File No': app.fileNumber,
                'Date': app.date,
                'Company': app.company,
                'Applicant': app.applicantName,
                'Proposed Owner': app.proposedOwner,
                'Current Owner': app.currentOwner,
                'Property Address': app.propertyAddress,
                'Branch': app.branchName,
                'Status': app.status
            }));

            const { exportToExcel } = await import('../../utils/exportUtils');
            exportToExcel(dataForExport, `Applications_Export_${new Date().toISOString().split('T')[0]}`);

        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleEdit = React.useCallback((id: number) => {
        navigate(`/application/${id}/edit`);
    }, [navigate]);

    const handleView = React.useCallback((id: number) => {
        navigate(`/application/${id}/view`);
    }, [navigate]);

    const handlePrint = React.useCallback((item: Application) => {
        printApplication(item);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-[1600px] mx-auto">

                {/* Main Content Card */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">

                    <div className="p-5 border-b border-slate-100 bg-white">
                        <div className="mb-6">
                            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-blue-600" />
                                Applications
                            </h1>
                            <p className="text-slate-500 text-xs mt-1">Manage and track company legal applications</p>
                        </div>
                        <ApplicationFilters
                            searchTerm={searchTerm}
                            onSearchChange={handleSearchChange}
                            onAdd={() => navigate('/application/new')}
                            onExport={handleExport}
                            isExporting={isExporting}
                            selectedCompany={selectedCompany}
                            onCompanyChange={(value) => {
                                setSelectedCompany(value);
                                setCurrentPage(1);
                            }}
                            companies={companies.map(c => c.name)}
                            branches={branches}
                            selectedBranch={selectedBranch}
                            onBranchChange={(value) => {
                                setSelectedBranch(value);
                                setCurrentPage(1);
                            }}
                            selectedStatus={selectedStatus}
                            onStatusChange={(value) => {
                                setSelectedStatus(value);
                                setCurrentPage(1);
                            }}
                            dateFrom={dateFrom}
                            onDateFromChange={(value) => {
                                setDateFrom(value);
                                setCurrentPage(1);
                            }}
                            dateTo={dateTo}
                            onDateToChange={(value) => {
                                setDateTo(value);
                                setCurrentPage(1);
                            }}
                        />
                    </div>

                    {/* Table Section */}
                    <div className="p-0">
                        <ApplicationTable
                            items={items}
                            isLoading={isLoading}
                            sortConfig={sortConfig}
                            onSort={handleSort}
                            onDelete={handleDelete}
                            onEdit={handleEdit}
                            onView={handleView}
                            onPrint={handlePrint}
                        />
                    </div>

                    {/* Pagination Section */}
                    <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                        <ApplicationPagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={(newLimit) => {
                                setItemsPerPage(newLimit);
                                setCurrentPage(1);
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={deleteModal.isOpen}
                title="Delete Application"
                message={`Are you sure you want to delete the application "${deleteModal.appTitle}"? This action cannot be undone.`}
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ isOpen: false, appId: null, appTitle: '' })}
            />
        </div>
    );
}

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import { useDebounce } from '../../hooks/useDebounce';

export default function ApplicationListPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { items, totalItems, totalPages, isLoading } = useAppSelector((state) => state.application);

    const [searchParams, setSearchParams] = useSearchParams();

    // Read state from URL Params
    const currentPage = parseInt(searchParams.get('page') || '1');
    const itemsPerPage = parseInt(searchParams.get('limit') || '10');
    const searchTerm = searchParams.get('search') || '';
    const selectedCompany = searchParams.get('company') || '';
    const selectedBranch = searchParams.get('branch') || '';
    const selectedStatus = searchParams.get('status') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    const sortField = searchParams.get('sortField') as keyof Application | null;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | null;

    const sortConfig = useMemo(() => {
        if (!sortField || !sortOrder) return null;
        return { field: sortField, direction: sortOrder };
    }, [sortField, sortOrder]);


    // Debounce search and filter values to reduce API calls
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const debouncedCompany = useDebounce(selectedCompany, 300);
    const debouncedBranch = useDebounce(selectedBranch, 300);
    const debouncedStatus = useDebounce(selectedStatus, 300);
    const debouncedDateFrom = useDebounce(dateFrom, 300);
    const debouncedDateTo = useDebounce(dateTo, 300);

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

    // Helper to update params
    const updateParams = (updates: Record<string, string | null>) => {
        const newParams = new URLSearchParams(searchParams);
        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === '') {
                newParams.delete(key);
            } else {
                newParams.set(key, value);
            }
        });
        setSearchParams(newParams);
    };

    // Fetch applications with debounced values
    React.useEffect(() => {
        dispatch(fetchApplications({
            page: currentPage,
            limit: itemsPerPage,
            search: debouncedSearchTerm,
            sortBy: sortField || undefined,
            order: sortOrder || undefined,
            company: debouncedCompany,
            branch: debouncedBranch,
            status: debouncedStatus,
            dateFrom: debouncedDateFrom,
            dateTo: debouncedDateTo
        }));
    }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, sortField, sortOrder, debouncedCompany, debouncedBranch, debouncedStatus, debouncedDateFrom, debouncedDateTo]);

    const handleSearchChange = (value: string) => {
        updateParams({ search: value, page: '1' });
    };

    const handleSort = React.useCallback((field: keyof Application) => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortField === field && sortOrder === 'asc') {
            direction = 'desc';
        }
        updateParams({ sortField: field, sortOrder: direction });
    }, [sortField, sortOrder, setSearchParams, searchParams]);

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
                limit: 10000,
                search: debouncedSearchTerm,
                sortBy: sortField,
                order: sortOrder,
                company: debouncedCompany,
                branch: debouncedBranch,
                status: debouncedStatus,
                dateFrom: debouncedDateFrom,
                dateTo: debouncedDateTo
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
                            onCompanyChange={(value) => updateParams({ company: value, page: '1' })}
                            companies={companies.map(c => c.name)}
                            branches={branches}
                            selectedBranch={selectedBranch}
                            onBranchChange={(value) => updateParams({ branch: value, page: '1' })}
                            selectedStatus={selectedStatus}
                            onStatusChange={(value) => updateParams({ status: value, page: '1' })}
                            dateFrom={dateFrom}
                            onDateFromChange={(value) => updateParams({ dateFrom: value, page: '1' })}
                            dateTo={dateTo}
                            onDateToChange={(value) => updateParams({ dateTo: value, page: '1' })}
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
                            onPageChange={(page) => updateParams({ page: page.toString() })}
                            onItemsPerPageChange={(limit) => updateParams({ limit: limit.toString(), page: '1' })}
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

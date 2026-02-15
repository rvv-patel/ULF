import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addApplication, updateApplication, fetchApplicationById, clearCurrentApplication } from '../../store/slices/applicationSlice';
import type { Application, ApplicationStatus } from './types';

import { fetchCompanies } from '../../store/slices/companySlice';
import { fetchBranches } from '../../store/slices/branchSlice';
import { toApiDate, fromApiDate } from '../../utils/dateUtils';

export default function ApplicationFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isEditMode = Boolean(id);

    const { items: companies } = useAppSelector((state) => state.company);
    const { items: branches } = useAppSelector((state) => state.branch);
    const { items: applications, currentApplication, isLoading } = useAppSelector((state) => state.application);

    // 1. Try to find in list, otherwise use currentApplication
    // Use loose equality (==) to handle string/number ID mismatch
    const existingItem = isEditMode
        ? applications.find(i => String(i.id) === String(id)) || (currentApplication && String(currentApplication.id) === String(id) ? currentApplication : null)
        : null;

    useEffect(() => {
        // console.log('ApplicationFormPage Debug:', { id, isEditMode, existingItem, currentAppId: currentApplication?.id, appsCount: applications.length });

        dispatch(fetchCompanies());
        dispatch(fetchBranches());

        // 2. Fetch application if edit mode and not found
        if (isEditMode && !existingItem) {
            // console.log('Fetching application by ID', id);
            dispatch(fetchApplicationById(Number(id)));
        }
    }, [dispatch, isEditMode, id, existingItem]); // Dependencies kept, but we separated cleanup

    // Cleanup effect - ONLY runs on unmount
    useEffect(() => {
        return () => {
            dispatch(clearCurrentApplication());
        };
    }, [dispatch]);

    const [formData, setFormData] = useState<Partial<Application>>({
        fileNumber: '',
        date: new Date().toISOString().split('T')[0],
        company: '',
        companyReference: '',
        applicantName: '',
        proposedOwner: '',
        currentOwner: '',
        branchName: '',
        propertyAddress: '',
        city: 'Ahmedabad',
        status: 'Login',
        sendToMail: false
    });

    // 3. Populate form when item is available
    useEffect(() => {
        if (existingItem) {
            // console.log('Populating form with existingItem:', existingItem);

            // Handle date robustly: check if it's ISO (YYYY-MM-DD...) or DD-MM-YYYY
            let dateVal = '';
            if (existingItem.date) {
                if (existingItem.date.match(/^\d{4}-\d{2}-\d{2}/)) {
                    // It is YYYY-MM-DD (ISO or simple), use as is (take first part if time exists)
                    dateVal = existingItem.date.split('T')[0];
                } else {
                    // Assume DD-MM-YYYY, convert to YYYY-MM-DD
                    dateVal = fromApiDate(existingItem.date);
                }
            }

            setFormData({
                fileNumber: existingItem.fileNumber,
                date: dateVal,
                company: existingItem.company,
                companyReference: existingItem.companyReference,
                applicantName: existingItem.applicantName,
                proposedOwner: existingItem.proposedOwner,
                currentOwner: existingItem.currentOwner,
                branchName: existingItem.branchName,
                propertyAddress: existingItem.propertyAddress,
                city: existingItem.city,
                status: existingItem.status,
                sendToMail: existingItem.sendToMail
            });
        }
    }, [existingItem]);

    const handleSubmit = async (shouldEmail: boolean = false) => {
        const payload: Application = {
            id: isEditMode ? Number(id) : Date.now(),
            fileNumber: formData.fileNumber || '',
            date: toApiDate(formData.date || ''),
            company: formData.company || '',
            companyReference: formData.companyReference || '',
            applicantName: formData.applicantName || '',
            proposedOwner: formData.proposedOwner || '',
            currentOwner: formData.currentOwner || '',
            branchName: formData.branchName || '',
            propertyAddress: formData.propertyAddress || '',
            city: formData.city || 'Ahmedabad',
            status: (formData.status as ApplicationStatus) || 'Login',
            sendToMail: shouldEmail,
            file: null
        } as Application;

        try {
            if (isEditMode) {
                await dispatch(updateApplication(payload)).unwrap();
            } else {
                await dispatch(addApplication(payload)).unwrap();
            }
            navigate(-1);
        } catch (err) {
            console.error('Failed to save:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-4">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 bg-white flex justify-between items-center">
                        <h1 className="text-xl font-bold text-slate-800">
                            {isEditMode ? 'Edit Application' : 'New Application'}
                        </h1>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="text-slate-500 hover:text-slate-700"
                        >
                            Cancel
                        </button>
                    </div>

                    <div className="p-6">
                        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(formData.sendToMail); }} className="space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">


                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Branch */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Branch</label>
                                    <select
                                        name="branchName"
                                        value={formData.branchName || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Branch</option>
                                        {branches.map((b) => (
                                            <option key={b.id} value={b.name}>{b.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Company */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company</label>
                                    <select
                                        name="company"
                                        value={formData.company || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    >
                                        <option value="">Select Company</option>
                                        {companies.map((c) => (
                                            <option key={c.id} value={c.name}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Company Reference */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Company Reference</label>
                                    <input
                                        type="text"
                                        name="companyReference"
                                        value={formData.companyReference || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Applicant Name */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Applicant Name</label>
                                    <input
                                        type="text"
                                        name="applicantName"
                                        value={formData.applicantName || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>

                                {/* Current Owner */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Current Owner</label>
                                    <input
                                        type="text"
                                        name="currentOwner"
                                        value={formData.currentOwner || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                {/* Proposed Owner */}
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proposed Owner</label>
                                    <input
                                        type="text"
                                        name="proposedOwner"
                                        value={formData.proposedOwner || ''}
                                        onChange={handleChange}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>



                                {/* Property Address */}
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Property Address</label>
                                    <textarea
                                        name="propertyAddress"
                                        value={formData.propertyAddress || ''}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>



                                {/* Send To Mail */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="sendToMail"
                                        id="sendToMail"
                                        checked={formData.sendToMail || false}
                                        onChange={handleChange}
                                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <label htmlFor="sendToMail" className="ml-2 block text-sm text-slate-700">
                                        Send Notification Mail
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-6 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => navigate(-1)}
                                    className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                >
                                    {isEditMode ? 'Update Application' : 'Create Application'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { addApplication, updateApplication } from '../../store/slices/applicationSlice';
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

    React.useEffect(() => {
        dispatch(fetchCompanies());
        dispatch(fetchBranches());
    }, [dispatch]);

    // In a real app we would fetch the item if isEditMode is true
    const existingItem = useAppSelector(state => state.application.items.find(i => i.id === Number(id)));

    const [formData, setFormData] = useState<Partial<Application>>({
        fileNumber: '',
        date: new Date().toLocaleDateString('en-US'), // Format: MM/DD/YYYY to match input type="date" approx
        company: '',
        companyReference: '',
        applicantName: '',
        proposedOwner: '',
        currentOwner: '',
        branchName: '',
        propertyAddress: '',
        city: 'Ahmedabad', // Default
        status: 'Blocked',
        sendToMail: false
    });

    React.useEffect(() => {
        if (existingItem) {
            setFormData({
                fileNumber: existingItem.fileNumber,
                date: fromApiDate(existingItem.date), // Convert DD-MM-YYYY to YYYY-MM-DD
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
            fileNumber: formData.fileNumber || '', // Backend handles generation if empty/new
            date: toApiDate(formData.date || ''), // Convert YYYY-MM-DD to DD-MM-YYYY
            company: formData.company || '',
            companyReference: formData.companyReference || '',
            applicantName: formData.applicantName || '',
            proposedOwner: formData.proposedOwner || '',
            currentOwner: formData.currentOwner || '',
            branchName: formData.branchName || '',
            propertyAddress: formData.propertyAddress || '',
            city: formData.city || 'Ahmedabad',
            status: (formData.status as ApplicationStatus) || 'Blocked',
            sendToMail: shouldEmail,
            file: null // File upload removed from UI as per image, keeping null
        } as Application;

        try {
            if (isEditMode) {
                await dispatch(updateApplication(payload)).unwrap();
            } else {
                await dispatch(addApplication(payload)).unwrap();
            }
            navigate('/application');
        } catch (err) {
            console.error('Failed to save:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Application' : 'New Application'}</h1>
                </div>

                <div className="space-y-6">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Application Date <span className="text-red-500">*</span></label>
                            <input
                                type="date"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.company}
                                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            >
                                <option value="">Select Company</option>
                                {companies.map((company) => (
                                    <option key={company.id} value={company.name}>{company.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Reference</label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.companyReference}
                                onChange={(e) => setFormData({ ...formData, companyReference: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Applicant Name <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.applicantName}
                                onChange={(e) => setFormData({ ...formData, applicantName: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Proposed Owner <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.proposedOwner}
                                onChange={(e) => setFormData({ ...formData, proposedOwner: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Owner <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={formData.currentOwner}
                                onChange={(e) => setFormData({ ...formData, currentOwner: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Row 3 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name <span className="text-red-500">*</span></label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                                value={formData.branchName}
                                onChange={(e) => setFormData({ ...formData, branchName: e.target.value })}
                            >
                                <option value="">Select Branch</option>
                                {branches.map((branch) => (
                                    <option key={branch.id} value={branch.name}>{branch.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Property Address <span className="text-red-500">*</span></label>
                        <textarea
                            rows={6}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                            value={formData.propertyAddress}
                            onChange={(e) => setFormData({ ...formData, propertyAddress: e.target.value })}
                        />
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/application')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit(false)}
                            className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition shadow-sm"
                        >
                            Confirm
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSubmit(true)}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            Confirm & Email
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

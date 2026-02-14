import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addCompany, updateCompany, fetchCompanies } from '../../../store/slices/companySlice';
import { Trash2, Plus, Mail, MapPin } from 'lucide-react';

export default function CompanyFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isEditMode = Boolean(id);

    const { items } = useAppSelector((state) => state.company);
    const existingItem = items.find((i) => i.id === Number(id));

    // Handle initial fetch if refreshed on edit page
    useEffect(() => {
        if (isEditMode && items.length === 0) {
            dispatch(fetchCompanies());
        }
    }, [dispatch, isEditMode, items.length]);

    const [name, setName] = useState('');
    const [address, setAddress] = useState('');
    const [emails, setEmails] = useState<string[]>(['']);

    useEffect(() => {
        if (existingItem) {
            setName(existingItem.name);
            setAddress(existingItem.address || '');
            setEmails(existingItem.emails.length > 0 ? existingItem.emails : ['']);
        }
    }, [existingItem]);

    const handleEmailChange = (index: number, value: string) => {
        const newEmails = [...emails];
        newEmails[index] = value;
        setEmails(newEmails);
    };

    const addEmailField = () => {
        setEmails([...emails, '']);
    };

    const removeEmailField = (index: number) => {
        if (emails.length > 1) {
            setEmails(emails.filter((_, i) => i !== index));
        } else {
            setEmails(['']); // Clear if only one
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Filter empty emails
        const validEmails = emails.map(e => e.trim()).filter(e => e !== '');

        if (!name.trim()) return alert('Company Name is required');

        const payload = {
            name,
            address,
            emails: validEmails
        };

        try {
            if (isEditMode) {
                await dispatch(updateCompany({ id: Number(id), ...payload })).unwrap();
            } else {
                await dispatch(addCompany(payload)).unwrap();
            }
            navigate('/masters/company');
        } catch (err) {
            console.error('Failed to save company:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl p-8">
                <div className="mb-8">
                    <h1 className="text-xl font-bold text-gray-900">{isEditMode ? 'Edit Company' : 'New Company'}</h1>
                    <p className="text-sm text-gray-500">Configure company details and notification emails</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Company Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            placeholder="e.g. Tata Consultancy Services"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    {/* Address Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <textarea
                                placeholder="e.g. 123 Tech Park, Bangalore"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300 min-h-[80px]"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Emails Section */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-gray-700">Notification Emails</label>
                            <button
                                type="button"
                                onClick={addEmailField}
                                className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                                <Plus size={14} /> Add Email
                            </button>
                        </div>

                        <div className="space-y-3">
                            {emails.map((email, index) => (
                                <div key={index} className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="e.g. contact@tcs.com"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none placeholder:text-gray-300"
                                            value={email}
                                            onChange={(e) => handleEmailChange(index, e.target.value)}
                                        />
                                    </div>
                                    {emails.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeEmailField(index)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">These emails will receive notifications for new file logins.</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/masters/company')}
                            className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm"
                        >
                            Save Company
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

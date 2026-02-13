import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addCompanyDocument, updateCompanyDocument } from '../../../store/slices/companyDocumentSlice';
import type { CompanyDocument } from './types';

export default function CompanyDocumentFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isEditMode = Boolean(id);

    const existingDocument = useAppSelector(state =>
        state.companyDocument.items.find(doc => doc.id === Number(id))
    );

    const [formData, setFormData] = useState<Partial<CompanyDocument>>({
        title: existingDocument?.title || '',
        documentFormat: existingDocument?.documentFormat || '.pdf',
        isUploaded: existingDocument?.isUploaded || false,
        isGenerate: existingDocument?.isGenerate || false
    });

    const [errors, setErrors] = useState<{ title?: string }>({});

    const documentType = formData.isUploaded ? 'upload' : formData.isGenerate ? 'generate' : '';

    const handleRadioChange = (type: 'upload' | 'generate') => {
        setFormData({
            ...formData,
            isUploaded: type === 'upload',
            isGenerate: type === 'generate'
        });
    };

    const validate = () => {
        const newErrors: { title?: string } = {};
        if (!formData.title?.trim()) {
            newErrors.title = 'Title is required';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validate()) return;

        const payload: CompanyDocument = {
            id: isEditMode ? Number(id) : Date.now(),
            title: formData.title || '',
            documentFormat: formData.documentFormat || '.pdf',
            isUploaded: formData.isUploaded || false,
            isGenerate: formData.isGenerate || false
        };

        try {
            if (isEditMode) {
                await dispatch(updateCompanyDocument(payload)).unwrap();
            } else {
                await dispatch(addCompanyDocument(payload)).unwrap();
            }
            navigate('/masters/company-documents');
        } catch (err) {
            console.error('Failed to save:', err);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 flex items-center justify-center">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-2xl p-8">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Company Document' : 'Add New Company Document'}
                    </h1>
                </div>

                <div className="space-y-6">
                    {/* Row 1: Title and Document Format */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className={`w-full px-4 py-2.5 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition`}
                                value={formData.title}
                                onChange={(e) => {
                                    setFormData({ ...formData, title: e.target.value });
                                    if (errors.title) setErrors({ ...errors, title: undefined });
                                }}
                                placeholder="Enter document title"
                            />
                            {errors.title && (
                                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Document Format
                            </label>
                            <select
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white appearance-none cursor-pointer transition"
                                value={formData.documentFormat}
                                onChange={(e) => setFormData({ ...formData, documentFormat: e.target.value })}
                            >
                                <option value=".pdf">.pdf</option>
                                <option value=".docx">.docx</option>
                                <option value=".xlsx">.xlsx</option>
                                <option value=".txt">.txt</option>
                                <option value=".jpg">.jpg</option>
                                <option value=".png">.png</option>
                            </select>
                        </div>
                    </div>

                    {/* Radio Options */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition group">
                            <input
                                type="radio"
                                name="documentType"
                                checked={documentType === 'upload'}
                                onChange={() => handleRadioChange('upload')}
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                                Upload Document
                            </span>
                        </label>

                        <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition group">
                            <input
                                type="radio"
                                name="documentType"
                                checked={documentType === 'generate'}
                                onChange={() => handleRadioChange('generate')}
                                className="w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                            />
                            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">
                                Generate Document
                            </span>
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/masters/company-documents')}
                            className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm hover:shadow"
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}




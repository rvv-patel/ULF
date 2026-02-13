import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Image as ImageIcon, X } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { addBranch, updateBranch, fetchBranches } from '../../../store/slices/branchSlice';

export default function BranchFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const isEditMode = Boolean(id);
    const existingBranch = useAppSelector(state =>
        state.branch.items.find(b => b.id === Number(id))
    );

    const [name, setName] = useState('');
    const [contactPerson, setContactPerson] = useState('');
    const [contactNumber, setContactNumber] = useState('');
    const [address, setAddress] = useState('');
    const [imagePreview, setImagePreview] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isEditMode) {
            if (existingBranch) {
                setName(existingBranch.name);
                setContactPerson(existingBranch.contactPerson);
                setContactNumber(existingBranch.contactNumber);
                setAddress(existingBranch.address);
                setImagePreview(existingBranch.image || '');
            } else {
                dispatch(fetchBranches());
            }
        }
    }, [isEditMode, existingBranch, dispatch]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImagePreview('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const branchData = {
                name,
                contactPerson,
                contactNumber,
                address,
                image: imagePreview || undefined
            };

            if (isEditMode && id) {
                await dispatch(updateBranch({ id: Number(id), data: branchData })).unwrap();
            } else {
                await dispatch(addBranch(branchData)).unwrap();
            }
            navigate('/masters/branches');
        } catch (error) {
            console.error('Failed to save branch:', error);
            alert('Failed to save branch. Please try again.');
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <button
                onClick={() => navigate('/masters/branches')}
                className="flex items-center text-gray-500 hover:text-gray-900 mb-6 transition-colors"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Branches
            </button>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                        {isEditMode ? 'Edit Branch' : 'New Branch'}
                    </h1>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload Area */}
                    <div className="flex justify-center">
                        <div
                            className={`relative w-full h-48 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all bg-gray-50 cursor-pointer overflow-hidden ${imagePreview ? 'border-blue-300' : 'border-gray-300 hover:border-gray-400'}`}
                            onClick={() => !imagePreview && fileInputRef.current?.click()}
                        >
                            {imagePreview ? (
                                <>
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); removeImage(); }}
                                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-md hover:bg-red-600 transition"
                                    >
                                        <X size={16} />
                                    </button>
                                </>
                            ) : (
                                <>
                                    <ImageIcon size={48} className="text-gray-300 mb-2" />
                                    <p className="text-sm text-gray-500 font-medium">Click to Upload Image</p>
                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                </>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Name</label>
                            <input
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="e.g. Ahmedabad Head Office"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                            <input
                                type="text"
                                required
                                value={contactPerson}
                                onChange={(e) => setContactPerson(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="e.g. Rahul Sharma"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                            <input
                                type="tel"
                                required
                                value={contactNumber}
                                onChange={(e) => setContactNumber(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
                                placeholder="e.g. +91 98765 43210"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                required
                                rows={3}
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none placeholder:text-gray-300"
                                placeholder="e.g. 101, Titanium City Center, Satellite, Ahmedabad, Gujarat 380015"
                            />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/masters/branches')}
                            className="flex-1 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition flex justify-center items-center gap-2"
                        >
                            <Save size={18} />
                            {isEditMode ? 'Update Branch' : 'Create Branch'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

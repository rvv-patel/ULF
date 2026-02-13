import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { updateSettings } from '../../../store/slices/appSettingsSlice';
import { Save, Loader2 } from 'lucide-react';
import Toast from '../../../components/Toast';

interface FormErrors {
    businessName?: string;
    businessEmail?: string;
}

interface ToastState {
    message: string;
    type: 'success' | 'error' | 'info';
}

export const BusinessDetailsForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings, isLoading, successMessage } = useSelector((state: RootState) => state.appSettings);

    const [formData, setFormData] = useState({
        businessName: '',
        businessEmail: '',
        defaultCC: '',
        replyTo: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [toast, setToast] = useState<ToastState | null>(null);

    // Initialize form data from settings
    useEffect(() => {
        if (settings) {
            setFormData({
                businessName: settings.businessName || '',
                businessEmail: settings.businessEmail || '',
                defaultCC: settings.defaultCC || '',
                replyTo: settings.replyTo || ''
            });
        }
    }, [settings]);

    // Show success toast when successMessage updates
    useEffect(() => {
        if (successMessage) {
            setToast({
                message: successMessage,
                type: 'success'
            });
            // Auto hide handled by Toast component, but we should clear local state if needed via onClose
        }
    }, [successMessage]);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};
        let isValid = true;

        if (!formData.businessName.trim()) {
            newErrors.businessName = 'Business name is required';
            isValid = false;
        }

        if (!formData.businessEmail.trim()) {
            newErrors.businessEmail = 'Business email is required';
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
            newErrors.businessEmail = 'Invalid email address';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Clear error when user types
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (validateForm()) {
            if (settings) {
                dispatch(updateSettings({
                    ...settings,
                    ...formData
                }));
            }
        } else {
            setToast({
                message: 'Please fix the errors in the form',
                type: 'error'
            });
        }
    };

    const handleCloseToast = () => {
        setToast(null);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={handleCloseToast}
                />
            )}

            <h3 className="text-lg font-bold text-gray-900 mb-6">Update Business Details</h3>

            <form onSubmit={onSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        name="businessName"
                        value={formData.businessName}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${errors.businessName ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.businessName && <p className="mt-1 text-sm text-red-500">{errors.businessName}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        name="businessEmail"
                        value={formData.businessEmail}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${errors.businessEmail ? 'border-red-500' : 'border-gray-300'
                            }`}
                    />
                    {errors.businessEmail && <p className="mt-1 text-sm text-red-500">{errors.businessEmail}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Default CC
                    </label>
                    <input
                        type="email"
                        name="defaultCC"
                        value={formData.defaultCC}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reply To
                    </label>
                    <input
                        type="email"
                        name="replyTo"
                        value={formData.replyTo}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none"
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : <Save className="h-5 w-5" />}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
};

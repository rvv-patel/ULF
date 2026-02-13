import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import { fetchSettings, clearMessages } from '../../store/slices/appSettingsSlice';
import { BusinessDetailsForm } from './components/BusinessDetailsForm';
import { SystemSettingsForm } from './components/SystemSettingsForm';
import { Settings, Building2, Server } from 'lucide-react';

const AppSettings: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings, isLoading, error } = useSelector((state: RootState) => state.appSettings);

    useEffect(() => {
        dispatch(fetchSettings());
        return () => {
            dispatch(clearMessages());
        }
    }, [dispatch]);

    const [activeTab, setActiveTab] = React.useState<'business' | 'system'>('business');

    if (isLoading && !settings) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error && !settings) {
        return (
            <div className="p-8 text-center">
                <div className="text-red-500 mb-2">Error loading settings</div>
                <div className="text-gray-500 text-sm">{error}</div>
                <button
                    onClick={() => dispatch(fetchSettings())}
                    className="mt-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                        <Settings size={24} />
                    </div>
                    Application Settings
                </h1>
                <p className="text-gray-500 mt-2 ml-14">
                    Manage global application configurations and business details.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Navigation */}
                <div className="hidden lg:block space-y-4">
                    <div className="sticky top-24">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 bg-gray-50">
                                <h3 className="font-semibold text-gray-700">Quick Navigation</h3>
                            </div>
                            <nav className="p-2 space-y-1">
                                <button
                                    onClick={() => setActiveTab('business')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'business'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                >
                                    <Building2 size={16} />
                                    Business Details
                                </button>
                                <button
                                    onClick={() => setActiveTab('system')}
                                    className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${activeTab === 'system'
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                                        }`}
                                >
                                    <Server size={16} />
                                    System Controls
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Right Column - Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {activeTab === 'business' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <BusinessDetailsForm />
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <SystemSettingsForm />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AppSettings;

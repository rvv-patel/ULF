import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../store/store';
import { updateSettings } from '../../../store/slices/appSettingsSlice';
import { AlertTriangle } from 'lucide-react';

export const SystemSettingsForm: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { settings, isLoading } = useSelector((state: RootState) => state.appSettings);

    const handleToggleMaintenance = () => {
        if (settings) {
            dispatch(updateSettings({
                ...settings,
                maintenanceMode: !settings.maintenanceMode
            }));
        }
    };

    if (!settings) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <AlertTriangle className="text-amber-500" size={20} />
                System Controls
            </h3>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100 mb-6">
                <div>
                    <h4 className="text-sm font-bold text-gray-900">Maintenance Mode</h4>
                    <p className="text-xs text-gray-500 mt-1">
                        Prevent non-admin users from accessing the application.
                    </p>
                </div>

                <button
                    onClick={handleToggleMaintenance}
                    disabled={isLoading}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${settings.maintenanceMode ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                >
                    <span className="sr-only">Enable maintenance mode</span>
                    <span
                        className={`${settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200`}
                    />
                </button>
            </div>

            {settings.maintenanceMode && (
                <div className="mb-8 p-3 bg-amber-50 text-amber-800 text-sm rounded-lg border border-amber-100 flex items-start gap-2">
                    <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                    <p>
                        <strong>Warning:</strong> The application is currently in maintenance mode. Only users with admin privileges can access the system.
                    </p>
                </div>
            )}

            <hr className="border-gray-100 my-6" />

            <div className="space-y-4">
                <h4 className="text-sm font-bold text-gray-900 mb-4">File Number Configuration</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Prefix</label>
                        <input
                            type="text"
                            value={settings.fileNumberPrefix || ''}
                            onChange={(e) => dispatch(updateSettings({ ...settings, fileNumberPrefix: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g. ULF"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Next Sequence</label>
                        <input
                            type="number"
                            value={settings.fileNumberSequence || ''}
                            onChange={(e) => dispatch(updateSettings({ ...settings, fileNumberSequence: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="e.g. 1000"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Padding Digits</label>
                        <input
                            type="number"
                            value={settings.padding || 4}
                            onChange={(e) => dispatch(updateSettings({ ...settings, padding: parseInt(e.target.value) || 0 }))}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            min="0"
                            max="10"
                        />
                    </div>
                    <div className="flex items-end">
                        <div className="w-full bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 text-blue-700 text-sm font-mono">
                            Preview: {settings.fileNumberPrefix}-{String(settings.fileNumberSequence || 0).padStart(settings.padding || 4, '0')}
                        </div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    Start new file numbers with this format. Example: {settings.fileNumberPrefix}-{String(settings.fileNumberSequence || 0).padStart(settings.padding || 4, '0')}
                </p>
            </div>
        </div>
    );
};

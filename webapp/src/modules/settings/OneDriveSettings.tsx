import { useEffect, useState } from 'react';
import { Cloud, CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw } from 'lucide-react';
import api from '../../api/axios';

export default function OneDriveSettings() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [authUrl, setAuthUrl] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        checkAuthStatus();

        // Check for OAuth callback success/error
        const params = new URLSearchParams(window.location.search);
        const onedriveStatus = params.get('onedrive');
        if (onedriveStatus === 'success') {
            setSuccess('OneDrive authenticated successfully!');
            setTimeout(() => setSuccess(''), 5000);
            // Remove query params
            window.history.replaceState({}, '', window.location.pathname);
            checkAuthStatus();
        } else if (onedriveStatus === 'error') {
            setError('OneDrive authentication failed. Please try again.');
            setTimeout(() => setError(''), 5000);
            window.history.replaceState({}, '', window.location.pathname);
        }
    }, []);

    const checkAuthStatus = async () => {
        try {
            setLoading(true);
            const response = await api.get('/onedrive/status');
            setIsAuthenticated(response.data.authenticated);
        } catch (err) {
            console.error('Failed to check OneDrive status:', err);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const response = await api.get('/onedrive/auth-url');
            setAuthUrl(response.data.authUrl);
            // Redirect to Microsoft OAuth
            window.location.href = response.data.authUrl;
        } catch (err) {
            setError('Failed to get authentication URL. Please try again.');
            console.error('Auth URL error:', err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Cloud className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">OneDrive Integration</h2>
                            <p className="text-sm text-slate-500 mt-0.5">
                                Automatically create document folders for new applications
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Status Messages */}
                    {success && (
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-green-800 font-medium">{success}</p>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-800 font-medium">{error}</p>
                        </div>
                    )}

                    {/* Connection Status */}
                    <div className="p-5 border border-slate-200 rounded-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-slate-800">Connection Status</h3>
                            <button
                                onClick={checkAuthStatus}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Refresh status"
                            >
                                <RefreshCw className={`h-4 w-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {loading ? (
                            <div className="flex items-center gap-3 text-slate-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Checking connection...</span>
                            </div>
                        ) : isAuthenticated ? (
                            <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-green-800">Connected to OneDrive</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Document folders will be automatically created for new applications
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-800">Not Connected</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                        Connect your OneDrive account to enable automatic folder creation
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* How it Works */}
                    <div className="p-5 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="flex items-start gap-3 mb-4">
                            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
                                <ul className="text-sm text-blue-800 space-y-2">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold">•</span>
                                        <span>When you create a new application, a folder is automatically created in your OneDrive</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold">•</span>
                                        <span>The folder is named with the file number and applicant name</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold">•</span>
                                        <span>An initial template document is created with application details</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-600 font-bold">•</span>
                                        <span>You can access the folder directly from OneDrive or via the application details</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Setup Instructions */}
                    {!isAuthenticated && (
                        <div className="p-5 border border-slate-200 rounded-xl">
                            <h3 className="font-semibold text-slate-800 mb-4">Setup Instructions</h3>
                            <ol className="text-sm text-slate-700 space-y-3">
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                                        1
                                    </span>
                                    <div>
                                        <p className="font-medium">Configure Azure App Registration</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Your administrator needs to configure OneDrive credentials in the backend .env file
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                                        2
                                    </span>
                                    <div>
                                        <p className="font-medium">Connect Your Account</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Click the button below and sign in with your Microsoft account
                                        </p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 font-semibold flex items-center justify-center text-xs">
                                        3
                                    </span>
                                    <div>
                                        <p className="font-medium">Grant Permissions</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            Allow the application to create folders and files in your OneDrive
                                        </p>
                                    </div>
                                </li>
                            </ol>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="flex justify-center pt-4">
                        {isAuthenticated ? (
                            <a
                                href="https://onedrive.live.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <ExternalLink className="h-5 w-5" />
                                Open OneDrive
                            </a>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                            >
                                <Cloud className="h-5 w-5" />
                                Connect OneDrive
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

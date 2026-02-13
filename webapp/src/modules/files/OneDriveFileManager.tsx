import { useEffect, useState, useRef } from 'react';
import { useMsal } from "@azure/msal-react";
import { InteractionStatus, BrowserAuthError } from "@azure/msal-browser";
import { loginRequest } from "../../config/authConfig";
import { useOneDrive } from "../../hooks/useOneDrive";
import { Folder, FileText, Upload, Plus, ChevronRight, Download, Trash2, Search, ArrowLeft, RefreshCw, Cloud } from 'lucide-react';

interface DriveItem {
    id: string;
    name: string;
    size: number;
    lastModifiedDateTime: string;
    folder?: { childCount: number };
    file?: { mimeType: string };
    webUrl: string;
}

interface Breadcrumb {
    id: string;
    name: string;
    parentId?: string;
}

export default function OneDriveFileManager() {
    const { instance, accounts, inProgress } = useMsal();
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const { listFiles, uploadFile, deleteFile, createFolder, downloadFile, searchFiles, loading, error } = useOneDrive(accessToken);

    const [files, setFiles] = useState<DriveItem[]>([]);
    const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([{ id: 'root', name: 'Home' }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [tokenError, setTokenError] = useState<string | null>(null);

    const currentFolder = breadcrumbs[breadcrumbs.length - 1];

    useEffect(() => {
        const getToken = async () => {
            if (accounts.length > 0) {
                const account = accounts[0];
                const request = {
                    ...loginRequest,
                    account: account
                };
                try {
                    const response = await instance.acquireTokenSilent(request);
                    setAccessToken(response.accessToken);
                    setTokenError(null);
                } catch (e) {
                    console.warn("Silent token acquisition failed", e);
                    if (e instanceof BrowserAuthError && e.errorCode === "interaction_required") {
                        setTokenError("Interaction required - click Sign In");
                    } else {
                        // setTokenError("Token error: " + (e as Error).message); // Only show relevant error
                    }
                }
            }
        };
        // Ensure we try to get token even if accounts array updates late
        if (accounts.length > 0) {
            getToken();
        }
    }, [accounts, instance, inProgress]);

    useEffect(() => {
        if (accessToken && currentFolder) {
            loadFiles();
        }
    }, [accessToken, currentFolder]);

    const loadFiles = async () => {
        try {
            const data = await listFiles(currentFolder.id);
            setFiles(data || []);
        } catch (e) {
            console.error(e);
        }
    };

    const handleFolderClick = (folder: DriveItem) => {
        setBreadcrumbs([...breadcrumbs, { id: folder.id, name: folder.name, parentId: currentFolder.id }]);
        setSearchQuery('');
    };

    const handleBreadcrumbClick = (index: number) => {
        setBreadcrumbs(breadcrumbs.slice(0, index + 1));
        setSearchQuery('');
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            await uploadFile(file, currentFolder.id);
            loadFiles();
            if (fileInputRef.current) fileInputRef.current.value = '';
        } catch (e) {
            alert('Upload failed');
        }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return;
        try {
            await createFolder(newFolderName, currentFolder.id);
            setNewFolderName('');
            setIsCreatingFolder(false);
            loadFiles();
        } catch (e) {
            alert('Folder creation failed');
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        try {
            await deleteFile(fileId);
            loadFiles();
        } catch (e) {
            alert('Delete failed');
        }
    };

    const handleDownload = async (file: DriveItem) => {
        try {
            if (file.folder) return;
            await downloadFile(file.id, file.name);
        } catch (e) {
            alert('Download failed');
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) {
            loadFiles();
            return;
        }
        try {
            const results = await searchFiles(searchQuery);
            setFiles(results || []);
        } catch (e) {
            console.error(e);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (!accessToken) {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] bg-gray-50">
                <Cloud className="h-16 w-16 text-blue-500 mb-4" />
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Connect to OneDrive</h2>

                {tokenError && (
                    <div className="text-red-500 mb-4 text-sm bg-red-50 p-2 rounded max-w-md text-center">
                        {tokenError}
                    </div>
                )}

                <p className="text-gray-500 mb-6">Sign in to access and manage your files</p>

                <button
                    onClick={() => instance.loginRedirect(loginRequest)}
                    disabled={inProgress !== InteractionStatus.None}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                    {inProgress !== InteractionStatus.None ? 'Redirecting...' : 'Sign in with Microsoft'}
                </button>
                <p className="mt-4 text-sm text-gray-500 text-center max-w-sm">
                    Clicking "Sign in" will redirect you to the Microsoft login page. You will return here automatically after logging in.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-[1600px] mx-auto">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[calc(100vh-100px)]">
                {/* Toolbar */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-2 overflow-x-auto">
                        {breadcrumbs.map((crumb, index) => (
                            <div key={crumb.id} className="flex items-center text-sm whitespace-nowrap">
                                {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                                <button
                                    onClick={() => handleBreadcrumbClick(index)}
                                    className={`hover:text-blue-600 font-medium ${index === breadcrumbs.length - 1 ? 'text-gray-900' : 'text-gray-500'}`}
                                >
                                    {crumb.name}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-b border-gray-100 flexFlex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
                            disabled={loading}
                        >
                            <Upload className="h-4 w-4" />
                            Upload File
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleUpload}
                        />

                        <div className="relative">
                            {isCreatingFolder ? (
                                <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                                    <input
                                        type="text"
                                        value={newFolderName}
                                        onChange={(e) => setNewFolderName(e.target.value)}
                                        placeholder="Folder name"
                                        className="px-2 py-1 text-sm outline-none w-32"
                                        autoFocus
                                        onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                                    />
                                    <button onClick={handleCreateFolder} className="p-1 hover:bg-green-50 text-green-600 rounded">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <button onClick={() => setIsCreatingFolder(false)} className="p-1 hover:bg-red-50 text-red-600 rounded">
                                        <ArrowLeft className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsCreatingFolder(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                                    disabled={loading}
                                >
                                    <Plus className="h-4 w-4" />
                                    New Folder
                                </button>
                            )}
                        </div>
                    </div>

                    <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 max-w-md">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search files..."
                                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </form>

                    <button onClick={loadFiles} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg" title="Refresh">
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-100 border-b border-red-200 px-4 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* File List */}
                <div className="flex-1 overflow-auto">
                    {loading && files.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400">Loading...</div>
                    ) : files.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <Folder className="h-12 w-12 mb-2 opacity-50" />
                            <p>No files found</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Name</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Size</th>
                                    <th className="p-4 text-xs font-semibold text-gray-500 uppercase">Modified</th>
                                    <th className="p-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {files.map((file) => (
                                    <tr key={file.id} className="hover:bg-gray-50 group transition-colors">
                                        <td className="p-4">
                                            <div
                                                className={`flex items-center gap-3 ${file.folder ? 'cursor-pointer' : ''}`}
                                                onClick={() => file.folder && handleFolderClick(file)}
                                            >
                                                {file.folder ? (
                                                    <Folder className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                                                ) : (
                                                    <FileText className="h-5 w-5 text-blue-500" />
                                                )}
                                                <span className={`text-sm ${file.folder ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                                                    {file.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500">{file.folder ? '-' : formatSize(file.size)}</td>
                                        <td className="p-4 text-sm text-gray-500">{new Date(file.lastModifiedDateTime).toLocaleDateString()}</td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {!file.folder && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                                                        className="p-1.5 hover:bg-gray-200 rounded text-gray-600"
                                                        title="Download"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}
                                                    className="p-1.5 hover:bg-red-50 rounded text-red-600"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}

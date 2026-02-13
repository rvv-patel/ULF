import { useState, useRef } from 'react';
import { Upload, X, File } from 'lucide-react';

interface PDFUploadModalProps {
    isOpen: boolean;
    pdfTitle: string;
    onClose: () => void;
    onUpload: (file: File) => Promise<void>;
}

export default function PDFUploadModal({ isOpen, pdfTitle, onClose, onUpload }: PDFUploadModalProps) {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate PDF only
        if (file.type !== 'application/pdf') {
            setError('Only PDF files are allowed');
            setSelectedFile(null);
            return;
        }

        setError('');
        setSelectedFile(file);
    };

    const handleConfirm = async () => {
        if (!selectedFile) {
            setError('Please select a PDF file');
            return;
        }

        setUploading(true);
        try {
            await onUpload(selectedFile);
            handleClose();
        } catch (err) {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        setSelectedFile(null);
        setError('');
        setUploading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in fade-in zoom-in-95 duration-200">
                {/* Close button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={uploading}
                >
                    <X size={20} />
                </button>

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                    <p className="text-sm text-gray-500 mt-1">Upload PDF for: <span className="font-semibold text-gray-700">{pdfTitle}</span></p>
                </div>

                {/* File Upload Area */}
                <div className="mb-6">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${selectedFile
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'
                            } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        <div className="flex flex-col items-center gap-3">
                            {selectedFile ? (
                                <>
                                    <File className="text-blue-500" size={40} />
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{selectedFile.name}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {(selectedFile.size / 1024).toFixed(2)} KB
                                        </p>
                                    </div>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="text-xs text-red-600 hover:text-red-700 font-medium"
                                        disabled={uploading}
                                    >
                                        Remove
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Upload className="text-gray-400" size={40} />
                                    <div>
                                        <p className="text-sm font-medium text-gray-700">Click to browse files</p>
                                        <p className="text-xs text-gray-500 mt-1">Only PDF files accepted</p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {error && (
                        <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                            <X size={14} />
                            {error}
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={uploading}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!selectedFile || uploading}
                    >
                        {uploading ? 'Uploading...' : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}

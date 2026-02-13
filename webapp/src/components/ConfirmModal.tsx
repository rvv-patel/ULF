import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmModalProps) {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: 'text-red-600',
                    iconBg: 'bg-red-100',
                    confirmBtn: 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                };
            case 'warning':
                return {
                    icon: 'text-orange-600',
                    iconBg: 'bg-orange-100',
                    confirmBtn: 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/20'
                };
            case 'info':
                return {
                    icon: 'text-blue-600',
                    iconBg: 'bg-blue-100',
                    confirmBtn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop - Only blur, no dark overlay */}
            <div
                className="fixed inset-0 backdrop-blur-sm transition-all"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="flex min-h-full items-center justify-center p-4">
                <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
                    {/* Close button */}
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Content */}
                    <div className="p-6">
                        {/* Icon */}
                        <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${styles.iconBg} mb-4`}>
                            <AlertTriangle className={`h-7 w-7 ${styles.icon}`} />
                        </div>

                        {/* Title */}
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-3">
                            {title}
                        </h3>

                        {/* Message */}
                        <p className="text-gray-600 text-center mb-6 leading-relaxed">
                            {message}
                        </p>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={onCancel}
                                className="flex-1 px-4 py-2.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                {cancelText}
                            </button>
                            <button
                                onClick={onConfirm}
                                className={`flex-1 px-4 py-2.5 text-white rounded-lg transition-colors font-medium shadow-sm ${styles.confirmBtn}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

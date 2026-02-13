import { useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: CheckCircle,
                    bgColor: 'bg-green-50',
                    borderColor: 'border-green-500',
                    textColor: 'text-green-800',
                    iconColor: 'text-green-500'
                };
            case 'error':
                return {
                    icon: XCircle,
                    bgColor: 'bg-red-50',
                    borderColor: 'border-red-500',
                    textColor: 'text-red-800',
                    iconColor: 'text-red-500'
                };
            case 'info':
                return {
                    icon: AlertCircle,
                    bgColor: 'bg-blue-50',
                    borderColor: 'border-blue-500',
                    textColor: 'text-blue-800',
                    iconColor: 'text-blue-500'
                };
        }
    };

    const styles = getTypeStyles();
    const Icon = styles.icon;

    return (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
            <div className={`${styles.bgColor} ${styles.borderColor} border-l-4 rounded-lg shadow-lg p-4 pr-12 max-w-md`}>
                <div className="flex items-start gap-3">
                    <Icon className={`${styles.iconColor} flex-shrink-0`} size={20} />
                    <p className={`${styles.textColor} text-sm font-medium`}>{message}</p>
                    <button
                        onClick={onClose}
                        className={`${styles.iconColor} hover:opacity-75 absolute top-3 right-3 transition-opacity`}
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}

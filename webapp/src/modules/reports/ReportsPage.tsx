import { useNavigate } from 'react-router-dom';
import { ClipboardList, BarChart3, Users, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReportCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    path: string;
    permission?: string;
    color: string;
}

const ReportCard = ({ title, description, icon, path, permission, color }: ReportCardProps) => {
    const navigate = useNavigate();
    const { hasPermission } = useAuth();

    if (permission && !hasPermission(permission)) {
        return null;
    }

    return (
        <div
            onClick={() => navigate(path)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group"
        >
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {title}
            </h3>
            <p className="text-sm text-gray-500">
                {description}
            </p>
        </div>
    );
};

export default function ReportsPage() {
    const reports = [
        {
            title: 'System Audit Logs',
            description: 'View detailed logs of user activities, logins, and system changes.',
            icon: <ClipboardList className="text-red-600 h-6 w-6" />,
            path: '/audit-logs',
            permission: 'view_audit_logs',
            color: 'bg-red-50'
        },
        // Placeholders for future reports
        {
            title: 'User Activity Summary',
            description: 'Overview of user registrations, logins, and active sessions.',
            icon: <Users className="text-purple-600 h-6 w-6" />,
            path: '#', // Placeholder
            permission: 'view_users', // Using existing permission
            color: 'bg-purple-50'
        },
        {
            title: 'Application Statistics',
            description: 'Charts showing application status distribution and trends.',
            icon: <FileText className="text-blue-600 h-6 w-6" />,
            path: '#', // Placeholder
            permission: 'view_applications',
            color: 'bg-blue-50'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50/50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <BarChart3 className="text-blue-600" />
                        Reports Dashboard
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Access all system reports and analytics from one place.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reports.map((report, index) => (
                        <ReportCard key={index} {...report} />
                    ))}
                </div>
            </div>
        </div>
    );
}

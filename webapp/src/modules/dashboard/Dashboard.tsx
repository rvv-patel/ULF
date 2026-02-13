import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileText,
    Building2,
    Users,
    GitBranch,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle,
    Clock,
    XCircle,
    BarChart3,
    PieChart,
    Activity
} from 'lucide-react';
import api from '../../api/axios';

interface DashboardStats {
    summary: {
        totalApplications: number;
        totalUsers: number;
        activeUsers: number;
        totalCompanies: number;
        totalBranches: number;
        totalQueries: number;
        openQueries: number;
        completionRate: number;
    };
    statusBreakdown: Array<{
        status: string;
        count: number;
        percentage: number;
    }>;
    monthlyTrend: Array<{
        month: string;
        count: number;
    }>;
    topCompanies: Array<{
        name: string;
        count: number;
    }>;
    topBranches: Array<{
        name: string;
        count: number;
    }>;
    recentApplications: Array<{
        id: number;
        fileNumber: string;
        applicantName: string;
        company: string;
        status: string;
        date: string;
    }>;
    performance: {
        avgProcessingTime: string;
        completionRate: string;
        pendingApplications: number;
        approvedApplications: number;
        rejectedApplications: number;
    };
}

export default function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    const fetchDashboardStats = async () => {
        try {
            setIsLoading(true);
            const response = await api.get('/dashboard/stats');
            setStats(response.data);
        } catch (err: any) {
            console.error('Failed to fetch dashboard stats:', err);
            setError('Failed to load dashboard data');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved':
                return <CheckCircle className="h-4 w-4" />;
            case 'pending':
                return <Clock className="h-4 w-4" />;
            case 'rejected':
            case 'cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <AlertCircle className="h-4 w-4" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'rejected':
            case 'cancelled':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                    <p className="text-red-600 font-bold mb-2">Error Loading Dashboard</p>
                    <p className="text-red-500 mb-4">{error || 'Unknown error occurred'}</p>
                    <button
                        onClick={fetchDashboardStats}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Activity className="h-8 w-8 text-blue-600" />
                            Dashboard
                        </h1>
                        <p className="text-slate-500 mt-1">Overview of your organization's performance and analytics</p>
                    </div>
                    <button
                        onClick={fetchDashboardStats}
                        className="px-4 py-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                        <TrendingUp className="h-4 w-4" />
                        Refresh
                    </button>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Applications"
                        value={stats.summary.totalApplications}
                        icon={FileText}
                        color="blue"
                        trend={`${stats.summary.completionRate}% completed`}
                        onClick={() => navigate('/application')}
                    />
                    <StatCard
                        title="Companies"
                        value={stats.summary.totalCompanies}
                        icon={Building2}
                        color="teal"
                        trend="Partner organizations"
                        onClick={() => navigate('/masters/company')}
                    />
                    <StatCard
                        title="Active Users"
                        value={stats.summary.activeUsers}
                        subtitle={`of ${stats.summary.totalUsers} total`}
                        icon={Users}
                        color="green"
                        trend="Team members"
                        onClick={() => navigate('/users')}
                    />
                    <StatCard
                        title="Branches"
                        value={stats.summary.totalBranches}
                        icon={GitBranch}
                        color="purple"
                        trend="Office locations"
                        onClick={() => navigate('/masters/branches')}
                    />
                </div>

                {/* Secondary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MiniStatCard
                        title="Open Queries"
                        value={stats.summary.openQueries}
                        total={stats.summary.totalQueries}
                        icon={AlertCircle}
                        color="orange"
                    />
                    <MiniStatCard
                        title="Pending"
                        value={stats.performance.pendingApplications}
                        icon={Clock}
                        color="yellow"
                    />
                    <MiniStatCard
                        title="Approved"
                        value={stats.performance.approvedApplications}
                        icon={CheckCircle}
                        color="green"
                    />
                    <MiniStatCard
                        title="Avg Processing"
                        value={stats.performance.avgProcessingTime}
                        icon={Activity}
                        color="indigo"
                        isText={true}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Status Breakdown */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <PieChart className="h-5 w-5 text-blue-600" />
                                Status Breakdown
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {stats.statusBreakdown.map((item, index) => (
                                <div key={index} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {getStatusIcon(item.status)}
                                            <span className="text-sm font-medium text-slate-700">{item.status}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-slate-900">
                                            {item.count} ({item.percentage}%)
                                        </span>
                                    </div>
                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                        <div
                                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                            style={{ width: `${item.percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Monthly Trend */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-blue-600" />
                                Monthly Trend
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {stats.monthlyTrend.map((item, index) => {
                                const maxCount = Math.max(...stats.monthlyTrend.map(m => m.count));
                                const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-slate-700">
                                                {new Date(item.month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                            </span>
                                            <span className="text-sm font-semibold text-slate-900">{item.count}</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Top Companies */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-teal-600" />
                            Top Companies
                        </h2>
                        <div className="space-y-3">
                            {stats.topCompanies.map((company, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{company.name}</span>
                                    </div>
                                    <span className="px-2.5 py-1 bg-teal-100 text-teal-800 rounded-full text-xs font-semibold">
                                        {company.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Top Branches */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <GitBranch className="h-5 w-5 text-purple-600" />
                            Top Branches
                        </h2>
                        <div className="space-y-3">
                            {stats.topBranches.map((branch, index) => (
                                <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{branch.name}</span>
                                    </div>
                                    <span className="px-2.5 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-semibold">
                                        {branch.count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Applications */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            Recent Applications
                        </h2>
                        <div className="space-y-3">
                            {stats.recentApplications.map((app, index) => (
                                <div
                                    key={index}
                                    onClick={() => navigate(`/application/${app.id}/view`)}
                                    className="p-3 bg-slate-50 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer group"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700">
                                            {app.fileNumber}
                                        </span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${getStatusColor(app.status)}`}>
                                            {app.status}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-600 truncate">{app.applicantName}</p>
                                    <p className="text-[10px] text-slate-400 mt-1">{app.date}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Stat Card Component
interface StatCardProps {
    title: string;
    value: number;
    subtitle?: string;
    icon: React.ElementType;
    color: 'blue' | 'teal' | 'green' | 'purple' | 'orange' | 'yellow' | 'indigo';
    trend: string;
    onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, color, trend, onClick }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600 border-blue-100',
        teal: 'bg-teal-50 text-teal-600 border-teal-100',
        green: 'bg-green-50 text-green-600 border-green-100',
        purple: 'bg-purple-50 text-purple-600 border-purple-100',
        orange: 'bg-orange-50 text-orange-600 border-orange-100',
        yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100'
    };

    return (
        <div
            onClick={onClick}
            className={`bg-white p-6 rounded-xl shadow-sm border border-slate-200 ${onClick ? 'cursor-pointer hover:shadow-md hover:scale-[1.02]' : ''} transition-all duration-200`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
            <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-slate-900">{value}</p>
                {subtitle && <span className="text-xs text-slate-400">{subtitle}</span>}
            </div>
            <p className="text-xs text-slate-500 mt-2">{trend}</p>
        </div>
    );
};

// Mini Stat Card Component
interface MiniStatCardProps {
    title: string;
    value: number | string;
    total?: number;
    icon: React.ElementType;
    color: 'orange' | 'yellow' | 'green' | 'indigo';
    isText?: boolean;
}

const MiniStatCard: React.FC<MiniStatCardProps> = ({ title, value, total, icon: Icon, color, isText = false }) => {
    const colorClasses = {
        orange: 'bg-orange-50 text-orange-600',
        yellow: 'bg-yellow-50 text-yellow-600',
        green: 'bg-green-50 text-green-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-xs text-slate-500 font-medium">{title}</p>
                    <p className={`${isText ? 'text-base' : 'text-2xl'} font-bold text-slate-900`}>
                        {value}
                        {total !== undefined && <span className="text-sm text-slate-400 font-normal"> / {total}</span>}
                    </p>
                </div>
            </div>
        </div>
    );
};

const pool = require('../config/database');
const BranchModel = require('../models/branchModel');
const UserModel = require('../models/userModel');
const CompanyModel = require('../models/companyModel');

exports.getDashboardStats = async (req, res) => {
    try {
        // Fetch data from PostgreSQL
        const branchList = await BranchModel.getAll();
        const userList = await UserModel.getAll();
        const companyList = await CompanyModel.getAll();

        const appsResult = await pool.query('SELECT * FROM applications WHERE status != \'deleted\'');
        const appList = appsResult.rows;

        const queriesResult = await pool.query('SELECT * FROM application_queries');
        const queryList = queriesResult.rows;

        // Calculate application statistics
        const statusCounts = appList.reduce((acc, app) => {
            const status = app.status || 'Unknown';
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});

        // Calculate monthly application trends (last 6 months)
        const monthlyData = {};
        const currentDate = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthlyData[monthKey] = 0;
        }

        appList.forEach(app => {
            if (app.date) {
                // Assuming date is in format YYYY-MM-DD or parseable by Date()
                // If stored as DD-MM-YYYY, new Date() might handle it incorrectly depending on locale or fail
                // But for now keeping simple assuming migration handled basic logic or Date parser works enough
                // Migration just copied the string.
                // If string is DD-MM-YYYY:
                const parts = app.date.split('-');
                let appDate;
                if (parts.length === 3 && parts[2].length === 4) { // DD-MM-YYYY
                    appDate = new Date(parts[2], parts[1] - 1, parts[0]);
                } else {
                    appDate = new Date(app.date);
                }

                if (!isNaN(appDate)) {
                    const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
                    if (monthlyData.hasOwnProperty(monthKey)) {
                        monthlyData[monthKey]++;
                    }
                }
            }
        });

        // Top companies by application count
        const companyApplications = appList.reduce((acc, app) => {
            if (app.company) {
                acc[app.company] = (acc[app.company] || 0) + 1;
            }
            return acc;
        }, {});

        const topCompanies = Object.entries(companyApplications)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Branch performance
        const branchApplications = appList.reduce((acc, app) => {
            if (app.branchName) {
                acc[app.branchName] = (acc[app.branchName] || 0) + 1;
            }
            return acc;
        }, {});

        const topBranches = Object.entries(branchApplications)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, count]) => ({ name, count }));

        // Recent applications
        const recentApplications = appList
            .sort((a, b) => {
                // Manual Sort for DD-MM-YYYY or Date objects
                // Ideally schema should change to DATE type.
                // For now, simple sort or string sort might be weak.
                // Using created_at or id might be better for "Recent" if date is unreliable
                return b.id - a.id;
            })
            .slice(0, 5)
            .map(app => ({
                id: app.id,
                fileNumber: app.fileNumber,
                applicantName: app.applicantName,
                company: app.company,
                status: app.status,
                date: app.date
            }));

        // Active users count
        const activeUsers = userList.filter(u => u.status === 'active').length;

        // Total queries count
        const totalQueries = queryList.length;

        const openQueries = queryList.filter(q => !q.isResolved).length;

        // Calculate completion rate
        const completedApps = statusCounts['Completed'] || 0;
        const completionRate = appList.length > 0
            ? Math.round((completedApps / appList.length) * 100)
            : 0;

        // Calculate average processing time (mock calculation)
        const avgProcessingTime = '14 days';

        const dashboardData = {
            summary: {
                totalApplications: appList.length,
                totalUsers: userList.length,
                activeUsers: activeUsers,
                totalCompanies: companyList.length,
                totalBranches: branchList.length,
                totalQueries: totalQueries,
                openQueries: openQueries,
                completionRate: completionRate
            },
            statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({
                status,
                count,
                percentage: Math.round((count / appList.length) * 100)
            })),
            monthlyTrend: Object.entries(monthlyData).map(([month, count]) => ({
                month,
                count
            })),
            topCompanies,
            topBranches,
            recentApplications,
            performance: {
                avgProcessingTime,
                completionRate: `${completionRate}%`,
                pendingApplications: statusCounts['Pending'] || 0,
                approvedApplications: statusCounts['Approved'] || 0,
                rejectedApplications: statusCounts['Rejected'] || 0
            }
        };

        res.json(dashboardData);
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ error: error.message });
    }
};

const fs = require('fs');
const path = require('path');
const BranchModel = require('../models/branchModel');
const UserModel = require('../models/userModel');
const CompanyModel = require('../models/companyModel');

const APPLICATIONS_PATH = path.join(__dirname, '../data/applications.json');

const readJsonFile = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error);
        return null;
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const applications = readJsonFile(APPLICATIONS_PATH);

        // Fetch data from PostgreSQL
        const branchList = await BranchModel.getAll();
        const userList = await UserModel.getAll();
        const companyList = await CompanyModel.getAll();

        if (!applications) {
            return res.status(500).json({ error: 'Failed to read data files' });
        }

        const appList = applications.applications || [];
        // companyList is already an array from Model
        // userList is already an array from Model


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
                const appDate = new Date(app.date);
                const monthKey = `${appDate.getFullYear()}-${String(appDate.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyData.hasOwnProperty(monthKey)) {
                    monthlyData[monthKey]++;
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
            .sort((a, b) => new Date(b.date) - new Date(a.date))
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
        const totalQueries = appList.reduce((acc, app) => {
            return acc + (app.queries?.length || 0);
        }, 0);

        const openQueries = appList.reduce((acc, app) => {
            return acc + (app.queries?.filter(q => !q.isResolved).length || 0);
        }, 0);

        // Calculate completion rate
        const completedApps = statusCounts['Completed'] || 0;
        const completionRate = appList.length > 0
            ? Math.round((completedApps / appList.length) * 100)
            : 0;

        // Calculate average processing time (mock calculation)
        const avgProcessingTime = '14 days'; // This would need actual date tracking

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

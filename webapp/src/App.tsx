
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import PermissionGuard from './components/PermissionGuard';
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';

import UserList from './modules/user/UserList';
import UserForm from './modules/user/UserForm';
import RoleList from './modules/role/RoleList';
import RoleForm from './modules/role/RoleForm';
import Dashboard from './modules/dashboard/Dashboard';
import ProfilePage from './modules/profile/ProfilePage';
import ApplicationListPage from './modules/application/ApplicationListPage';
import ApplicationFormPage from './modules/application/ApplicationFormPage';
import ApplicationViewPage from './modules/application/ApplicationViewPage';
import CompanyListPage from './modules/masters/company/CompanyListPage';
import CompanyFormPage from './modules/masters/company/CompanyFormPage';
import BranchListPage from './modules/masters/branch/BranchListPage';
import BranchFormPage from './modules/masters/branch/BranchFormPage';
import ApplicationDocumentListPage from './modules/masters/applicationDocument/ApplicationDocumentListPage';

import CompanyDocumentListPage from './modules/masters/companyDocument/CompanyDocumentListPage';

import OneDriveFileManager from './modules/files/OneDriveFileManager';
import AppSettings from './modules/appSettings/AppSettings';
import './index.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<Layout />}>

          {/* Dashboard Route - Accessible to all authenticated users (or view_dashboard if strict) */}
          {/* Dashboard Route - Accessible to all authenticated users (or view_dashboard if strict) */}
          <Route element={<PermissionGuard permission="view_dashboard" />}>
            <Route path="/" element={<Dashboard />} />
          </Route>

          <Route element={<PermissionGuard permission="view_files" />}>
            <Route path="/files" element={<OneDriveFileManager />} />
          </Route>

          <Route path="/profile" element={<ProfilePage />} />

          {/* User Routes */}
          <Route element={<PermissionGuard permission="view_users" />}>
            <Route path="/users" element={<UserList />} />
          </Route>
          <Route element={<PermissionGuard permission="add_users" />}>
            <Route path="/users/new" element={<UserForm />} />
          </Route>
          <Route element={<PermissionGuard permission="edit_users" />}>
            <Route path="/users/:id/edit" element={<UserForm />} />
          </Route>

          {/* Role Routes */}
          <Route element={<PermissionGuard permission="view_roles" />}>
            <Route path="/roles" element={<RoleList />} />
          </Route>
          <Route element={<PermissionGuard permission="add_roles" />}>
            <Route path="/roles/new" element={<RoleForm />} />
          </Route>
          <Route element={<PermissionGuard permission="edit_roles" />}>
            <Route path="/roles/:id/edit" element={<RoleForm />} />
          </Route>

          {/* Application Routes */}
          <Route element={<PermissionGuard permission="view_applications" />}>
            <Route path="/application" element={<ApplicationListPage />} />
            <Route path="/application/:id/view" element={<ApplicationViewPage />} /> {/* Added route */}
          </Route>
          <Route element={<PermissionGuard permission="add_applications" />}>
            <Route path="/application/new" element={<ApplicationFormPage />} />
          </Route>
          <Route element={<PermissionGuard permission="edit_applications" />}>
            <Route path="/application/:id/edit" element={<ApplicationFormPage />} />
          </Route>

          {/* Master Modules */}
          {/* Company */}
          <Route element={<PermissionGuard permission="view_companies" />}>
            <Route path="/masters/company" element={<CompanyListPage />} />
          </Route>
          <Route element={<PermissionGuard permission="add_companies" />}>
            <Route path="/masters/company/new" element={<CompanyFormPage />} />
          </Route>
          <Route element={<PermissionGuard permission="edit_companies" />}>
            <Route path="/masters/company/:id/edit" element={<CompanyFormPage />} />
          </Route>

          {/* Branch */}
          <Route element={<PermissionGuard permission="view_branches" />}>
            <Route path="/masters/branches" element={<BranchListPage />} />
          </Route>
          <Route element={<PermissionGuard permission="add_branches" />}>
            <Route path="/masters/branches/new" element={<BranchFormPage />} />
          </Route>
          <Route element={<PermissionGuard permission="edit_branches" />}>
            <Route path="/masters/branches/:id/edit" element={<BranchFormPage />} />
          </Route>

          {/* Application Documents */}
          <Route element={<PermissionGuard permission="view_application_documents" />}>
            <Route path="/masters/application-documents" element={<ApplicationDocumentListPage />} />
          </Route>

          {/* Company Documents */}
          <Route element={<PermissionGuard permission="view_company_documents" />}>
            <Route path="/masters/company-documents" element={<CompanyDocumentListPage />} />
          </Route>

          {/* App Settings */}
          {/* <Route element={<PermissionGuard permission="manage_settings" />}> */}
          <Route path="/settings" element={<AppSettings />} />
          {/* </Route> */}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

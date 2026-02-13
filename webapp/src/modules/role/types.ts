export interface Permission {
    id: string;
    name: string;
    description: string;
    module: string;
    action: 'view' | 'add' | 'edit' | 'delete';
}

export interface Role {
    id: number;
    name: string;
    description: string;
    permissions: string[]; // List of permission IDs
    userCount: number;
}

export interface RoleState {
    items: Role[];
    permissions: Permission[];
    loading: boolean;
    error: string | null;
}

// Helper to generate standard CRUD permissions for a module
const createModulePermissions = (module: string, moduleId: string): Permission[] => [
    { id: `view_${moduleId}`, name: 'View', description: `View ${module} list and details`, module, action: 'view' },
    { id: `add_${moduleId}`, name: 'Add', description: `Create new ${module}`, module, action: 'add' },
    { id: `edit_${moduleId}`, name: 'Edit', description: `Update existing ${module}`, module, action: 'edit' },
    { id: `delete_${moduleId}`, name: 'Delete', description: `Remove ${module}`, module, action: 'delete' },
];

export const AVAILABLE_PERMISSIONS: Permission[] = [
    // Dashboard
    { id: 'view_dashboard', name: 'View Dashboard', description: 'Access to view the dashboard', module: 'Dashboard', action: 'view' },

    // Applications
    ...createModulePermissions('Applications', 'applications'),

    // Users
    ...createModulePermissions('Users', 'users'),

    // Roles
    ...createModulePermissions('Roles', 'roles'),

    // Branches
    ...createModulePermissions('Branches', 'branches'),

    // Companies
    ...createModulePermissions('Companies', 'companies'),

    // Application Documents
    ...createModulePermissions('Application Documents', 'application_documents'),

    // Company Documents
    ...createModulePermissions('Company Documents', 'company_documents'),
];

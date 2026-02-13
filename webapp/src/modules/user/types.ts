export type UserStatus = 'active' | 'inactive' | 'on_leave';


export interface User {
    id: number;
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    role: string;
    status: UserStatus;
    phone: string;
    dateJoined: string;
    avatar?: string;
    permissions?: string[];
    assignedBranches?: number[];
    assignedCompanies?: number[];
    address: string;
    lastForcedLogoutAt?: string; // Timestamp for force logout
}

export interface UserState {
    items: User[];
    loading: boolean;
    error: string | null;
}

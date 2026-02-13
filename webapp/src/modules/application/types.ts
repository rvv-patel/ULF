export type ApplicationStatus = 'Blocked' | 'Query' | 'TSRPDF' | 'Modify' | 'Login';

export interface Application {
    id: number;
    date: string;
    company: string;
    companyReference: string;
    applicantName: string;
    proposedOwner: string;
    currentOwner: string;
    branchName: string;
    propertyAddress: string;
    status: ApplicationStatus;
    city: string;
    fileNumber: string;
    sendToMail: boolean;
    file: string | null;
    queries?: any[];
}

export interface ApplicationState {
    items: Application[];
    isLoading: boolean;
    error: string | null;
}

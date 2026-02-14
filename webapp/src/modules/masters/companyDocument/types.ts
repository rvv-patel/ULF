export interface CompanyDocument {
    id: number;
    title: string;
    documentFormat: string; // Will always be '.docx' for new records
}

export interface CompanyDocumentState {
    items: CompanyDocument[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}

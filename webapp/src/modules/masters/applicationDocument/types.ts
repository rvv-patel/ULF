export interface ApplicationDocument {
    id: number;
    title: string;
    documentFormat: string; // Will always be 'PDF' for new records
}

export interface ApplicationDocumentState {
    items: ApplicationDocument[];
    totalItems: number;
    totalPages: number;
    isLoading: boolean;
    error: string | null;
}

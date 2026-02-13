export interface CompanyDocument {
    id: number;
    title: string;
    documentFormat: string;
    isUploaded: boolean;
    isGenerate: boolean;
}

export interface CompanyDocumentState {
    items: CompanyDocument[];
    isLoading: boolean;
    error: string | null;
}

export interface ApplicationDocument {
    id: number;
    title: string;
    documentFormat: string;
    isUploaded: boolean;
    isGenerate: boolean;
}

export interface ApplicationDocumentState {
    items: ApplicationDocument[];
    isLoading: boolean;
    error: string | null;
}

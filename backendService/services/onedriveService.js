const { Client } = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');
const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');

const ROOT_FOLDER = process.env.ONEDRIVE_UPLOAD_ROOT || 'UNIQUE LAGEL FIRM';

class OneDriveService {

    // Initialize Graph client with access token
    getAuthenticatedClient(accessToken) {
        if (!accessToken) {
            throw new Error('Access token is required for OneDrive operations');
        }
        return Client.init({
            authProvider: (done) => {
                done(null, accessToken);
            }
        });
    }

    // --- Core Methods from User Request ---

    // List files from OneDrive root
    async listFiles(accessToken, folderId = 'root') {
        try {
            const client = this.getAuthenticatedClient(accessToken);
            const endpoint = folderId === 'root'
                ? '/me/drive/root/children'
                : `/me/drive/items/${folderId}/children`;

            const result = await client.api(endpoint).get();
            return result.value;
        } catch (error) {
            throw new Error(`Error listing files: ${error.message}`);
        }
    }

    // Upload file to OneDrive
    async uploadFile(accessToken, fileName, fileBuffer, folderId = 'root') {
        try {
            const client = this.getAuthenticatedClient(accessToken);
            let endpoint;

            if (folderId.startsWith('root:')) {
                // It's a path
                endpoint = `/me/drive/${folderId}/${fileName}:/content`;
            } else if (folderId === 'root') {
                endpoint = `/me/drive/root:/${fileName}:/content`;
            } else {
                // It's an ID
                endpoint = `/me/drive/items/${folderId}:/${fileName}:/content`;
            }

            const result = await client.api(endpoint)
                .put(fileBuffer);

            return result;
        } catch (error) {
            throw new Error(`Error uploading file: ${error.message}`);
        }
    }

    // Create folder in OneDrive
    async createFolder(accessToken, folderName, parentFolderId = 'root') {
        try {
            const client = this.getAuthenticatedClient(accessToken);
            const folderData = {
                name: folderName,
                folder: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            };

            let endpoint;
            if (parentFolderId.startsWith('root:')) {
                // Parent is a path, e.g. 'root:/path/to/parent'
                endpoint = `/me/drive/${parentFolderId}:/children`;
            } else if (parentFolderId === 'root') {
                endpoint = '/me/drive/root/children';
            } else {
                endpoint = `/me/drive/items/${parentFolderId}/children`;
            }

            const result = await client.api(endpoint).post(folderData);
            return result;
        } catch (error) {
            throw new Error(`Error creating folder: ${error.message}`);
        }
    }

    // --- Custom Business Logic helper ---

    /**
     * Ensure a folder exists via Path (Recursive if needed)
     * Returns the final folder path relative to drive root (e.g. root:/A/B)
     */
    async ensureAbsolutePath(accessToken, pathParts) {
        const client = this.getAuthenticatedClient(accessToken);
        let currentPath = 'root'; // Start at root

        for (const part of pathParts) {
            // Check if folder exists at currentPath + /part
            // Construct check path. 
            // If currentPath is 'root', check 'root:/part'
            // If currentPath is 'root:/A', check 'root:/A/part'

            const nextPath = currentPath === 'root' ? `root:/${part}` : `${currentPath}/${part}`;

            try {
                // Try to get the folder
                await client.api(`/me/drive/${nextPath}`).get();
                // If success, it exists. Update currentPath
                currentPath = nextPath;
            } catch (error) {
                if (error.statusCode === 404 || error.code === 'itemNotFound') {
                    // Not found, create it in currentPath
                    try {
                        let parentEndpoint;
                        if (currentPath === 'root') {
                            parentEndpoint = '/me/drive/root/children';
                        } else {
                            // currentPath is mostly 'root:/path'
                            // We need to POST to .../children
                            parentEndpoint = `/me/drive/${currentPath}:/children`;
                        }

                        const folderData = {
                            name: part,
                            folder: {},
                            '@microsoft.graph.conflictBehavior': 'rename'
                        };

                        await client.api(parentEndpoint).post(folderData);
                        currentPath = nextPath; // Success
                    } catch (createError) {
                        console.error(`Failed to create folder ${part} in ${currentPath}`, createError);
                        throw createError;
                    }
                } else {
                    throw error;
                }
            }
        }
        return currentPath;
    }

    // Create company document (Business Logic)
    async createCompanyDocument(accessToken, companyName, docType) {
        try {
            console.log(`Generating ${docType} for ${companyName}...`);

            const client = this.getAuthenticatedClient(accessToken);

            // 1. Locate the Template File (letterpad.docx)
            // Path: root:/UNIQUE LAGEL FIRM/letterpad.docx
            try {
                // Check if template exists and get its ID
                const templatePath = `/me/drive/root:/${ROOT_FOLDER}/letterpad.docx`;
                const templateItem = await client.api(templatePath).get();

                // 2. Ensure Destination Folder Exists
                const pathParts = [ROOT_FOLDER, 'COMPANY_DATA', companyName];
                // This helper returns the path 'root:/...'
                // We need the ID of the destination folder for the copy operation usually, 
                // but the Copy API support parentReference with path? 
                // Actually Graph API Copy requires parentReference to have an ID.

                // Let's get the target folder ID.
                // We'll use our ensureAbsolutePath, but we need the ID, not just the path string.
                // Let's modify ensureAbsolutePath to return the Item, or just fetch it after ensuring.

                await this.ensureAbsolutePath(accessToken, pathParts);
                // Now fetch the folder to get its ID
                const targetPath = `/me/drive/root:/${pathParts.join('/')}`;
                const targetFolder = await client.api(targetPath).get();

                // 3. Perform Copy
                // POST /items/{itemId}/copy
                const copyPayload = {
                    parentReference: {
                        id: targetFolder.id
                    },
                    name: `${companyName}-${docType}.docx`
                };

                const result = await client.api(`/me/drive/items/${templateItem.id}/copy`).post(copyPayload);

                // Copy is async, so we can't get the ID immediately from the result.
                // We will try to fetch the file by its path to get the metadata.
                // We might need a small delay or retry logic, but let's try immediate fetch first.
                // If it fails (404), maybe wait 1s.

                const newFilePath = `/me/drive/root:/${pathParts.join('/')}/${copyPayload.name}`;

                // Simple retry logic
                let fileMetadata = null;
                for (let i = 0; i < 5; i++) {
                    try {
                        // Wait increasing amounts: 0.5s, 1s, 2s...
                        if (i > 0) await new Promise(r => setTimeout(r, 500 * i));
                        fileMetadata = await client.api(newFilePath).get();
                        if (fileMetadata && fileMetadata.id) break;
                    } catch (e) {
                        // Ignore 404 while waiting for copy to finish
                        if (e.statusCode !== 404 && e.code !== 'itemNotFound') throw e;
                    }
                }

                if (!fileMetadata) {
                    throw new Error("File created but could not retrieve metadata (timeout).");
                }

                return {
                    id: fileMetadata.id,
                    name: fileMetadata.name,
                    webUrl: fileMetadata.webUrl,
                    createdDateTime: new Date().toISOString()
                };

            } catch (error) {
                if (error.code === 'itemNotFound') {
                    throw new Error("Template 'letterpad.docx' not found in 'UNIQUE LAGEL FIRM' folder.");
                }
                throw error;
            }
        } catch (error) {
            console.error('Error creating company document:', error);
            throw error;
        }
    }

    // List company files (for status check)
    async getCompanyFiles(accessToken, companyName) {
        try {
            const pathParts = [ROOT_FOLDER, 'COMPANY_DATA', companyName];
            // We need to find the folder path first. 
            // Query: /me/drive/root:/ROOT_FOLDER/COMPANY_DATA/{companyName}:/children
            const endpoint = `/me/drive/root:/${pathParts.join('/')}:/children`;

            const client = this.getAuthenticatedClient(accessToken);
            const result = await client.api(endpoint).get();
            return result.value || [];
        } catch (error) {
            if (error.statusCode === 404 || error.code === 'itemNotFound') {
                return []; // Folder doesn't exist yet, so no files
            }
            throw new Error(`Error listing company files: ${error.message}`);
        }
    }

    // --- Other User Methods ---

    // Download file from OneDrive
    async downloadFile(accessToken, fileId) {
        try {
            const client = this.getAuthenticatedClient(accessToken);
            const result = await client.api(`/me/drive/items/${fileId}/content`).get();
            return result;
        } catch (error) {
            throw new Error(`Error downloading file: ${error.message}`);
        }
    }

    // Delete file from OneDrive - REMOVED per user request
    // async deleteFile(accessToken, fileId) { ... }

    // Search files in OneDrive
    async searchFiles(accessToken, query) {
        try {
            const client = this.getAuthenticatedClient(accessToken);
            const result = await client.api(`/me/drive/root/search(q='${query}')`).get();
            return result.value;
        } catch (error) {
            throw new Error(`Error searching files: ${error.message}`);
        }
    }

    // --- Document Copy to Structure Feature ---

    // Helper: Get Financial Year string (e.g., "2025-2026")
    getFinancialYear(date) {
        const month = date.getMonth(); // 0-11
        const year = date.getFullYear();
        // If month is Jan-Mar (0-2), FY started previous year. 
        // Example: Mar 2026 is FY 2025-2026. 
        // Example: Apr 2026 is FY 2026-2027.
        if (month < 3) {
            return `${year - 1}-${year}`;
        } else {
            return `${year}-${year + 1}`;
        }
    }

    // Copy document to specific structured folder
    async copyDocumentToStructuredFolder(accessToken, fileId, applicationFileNo, companyName, applicationDate) {
        try {
            const client = this.getAuthenticatedClient(accessToken);

            // 1. Get Source File Metadata to get its name
            const sourceFile = await client.api(`/me/drive/items/${fileId}`).get();
            let originalName = sourceFile.name; // e.g. "ICICI Bank-TSR.docx" or "TSR.docx"

            // Strip company name if provided
            if (companyName) {
                // Regex to remove "CompanyName" + optional separators like " - ", "-", "_" at the start
                // We escape special regex chars in companyName just in case
                const escapedCompany = companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const regex = new RegExp(`^${escapedCompany}\\s*[-_]?\\s*`, 'i');
                originalName = originalName.replace(regex, '');
            }

            // 2. Parse Application Date (format: dd-mm-yyyy)
            console.log('[copyDocument] Received applicationDate:', applicationDate);
            const [day, month, year] = applicationDate.split('-').map(Number);
            const appDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date
            console.log('[copyDocument] Parsed date:', appDate.toISOString(), '| Day:', day, 'Month:', month, 'Year:', year);

            // 3. Determine Target Folder Path using application date
            const financialYear = this.getFinancialYear(appDate);
            const monthName = appDate.toLocaleString('default', { month: 'long' }); // e.g., "December"
            console.log('[copyDocument] Financial Year:', financialYear, '| Month:', monthName);

            // Structure: ROOT_FOLDER -> FY -> Month -> AppNo
            const pathParts = [
                ROOT_FOLDER,
                financialYear,
                monthName,
                applicationFileNo
            ];
            console.log('[copyDocument] Path parts:', pathParts);
            console.log('[copyDocument] Full path:', pathParts.join('/'));

            // 3. Ensure Target Folder Exists
            await this.ensureAbsolutePath(accessToken, pathParts);

            // 4. Get Target Folder ID
            const targetPath = `/me/drive/root:/${pathParts.join('/')}`;
            const targetFolder = await client.api(targetPath).get();

            // 5. Check for existing files with same base name and determine suffix
            const baseName = originalName.replace(/\.docx$/i, ''); // Remove .docx extension
            const targetFolderPath = `${targetPath}:/children`;

            // List existing files in target folder
            const existingFiles = await client.api(targetFolderPath).get();
            const existingFileNames = (existingFiles.value || []).map(f => f.name);

            // Find files that match pattern: {fileNo}-{baseName}*.docx
            const filePrefix = `${applicationFileNo}-${baseName}`;
            const matchingFiles = existingFileNames.filter(name =>
                name.startsWith(filePrefix) && name.endsWith('.docx')
            );

            // Determine suffix: no suffix for first, -1 for second, -2 for third, etc.
            let newName;
            if (matchingFiles.length === 0 || !matchingFiles.includes(`${filePrefix}.docx`)) {
                // No existing file, use base name without suffix
                newName = `${applicationFileNo}-${originalName}`;
            } else {
                // Files exist, find next available number
                let suffix = 1;
                while (matchingFiles.includes(`${filePrefix}-${suffix}.docx`)) {
                    suffix++;
                }
                newName = `${applicationFileNo}-${baseName}-${suffix}.docx`;
            }

            // 6. Perform Copy
            const copyPayload = {
                parentReference: {
                    id: targetFolder.id
                },
                name: newName
            };

            // Monitor copy operation
            const copyMonitorUrl = await client.api(`/me/drive/items/${fileId}/copy`)
                .responseType('raw') // We need the headers
                .post(copyPayload);

            // Poll for the new file to get metadata
            const newFilePath = `/me/drive/root:/${pathParts.join('/')}/${newName}`;
            let fileMetadata = null;

            // Retry logic (5 attempts, increasing delay)
            for (let i = 0; i < 5; i++) {
                try {
                    // Wait: 0.5s, 1s, 2s...
                    if (i > 0) await new Promise(r => setTimeout(r, 500 * (i + 1)));
                    fileMetadata = await client.api(newFilePath).get();
                    if (fileMetadata && fileMetadata.id) break;
                } catch (e) {
                    // Ignore 404 while waiting for copy to finish
                    if (e.statusCode !== 404 && e.code !== 'itemNotFound') throw e;
                }
            }

            if (!fileMetadata) {
                // If we can't find it, we can't store the ID/WebURL. 
                // We should probably throw or return partial data.
                // Let's return partial but indicate pending? 
                // Or best to throw so UI knows it "failed" to verify.
                console.warn("Copy started but file metadata retrieval timed out.");
                return {
                    success: true,
                    targetPath: pathParts.join('/'),
                    newName: newName,
                    message: "Copy operation started (metadata pending)."
                };
            }

            return {
                success: true,
                id: fileMetadata.id,
                name: fileMetadata.name,
                webUrl: fileMetadata.webUrl,
                createdDateTime: fileMetadata.createdDateTime,
                targetPath: pathParts.join('/')
            };

        } catch (error) {
            console.error('Error copying structured document:', error);
            throw error;
        }
    }
}

module.exports = new OneDriveService();

const express = require('express');
const router = express.Router();
const oneDriveService = require('../services/onedriveService');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../data/companies.json');
const APP_DB_PATH = path.join(__dirname, '../data/applications.json');

const readDb = () => {
    try {
        if (!fs.existsSync(DB_PATH)) return { companies: [] };
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { companies: [] };
    }
};

const writeDb = (data) => {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

const readAppDb = () => {
    try {
        if (!fs.existsSync(APP_DB_PATH)) return { applications: [] };
        const data = fs.readFileSync(APP_DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return { applications: [] };
    }
};

const writeAppDb = (data) => {
    fs.writeFileSync(APP_DB_PATH, JSON.stringify(data, null, 2));
};

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Middleware to extract Graph Token from Authorization header
const requireOneDriveAuth = async (req, res, next) => {
    // Frontend sends 'Bearer <graph_access_token>'
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No access token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    req.accessToken = token; // Inject Graph Token for service use
    next();
};



// Use requireOneDriveAuth instead of verifyToken for all routes below


/**
 * @route POST /api/onedrive/create-company-document
 * @desc Create a company document in OneDrive and save to DB
 * @access Private (Requires Bearer Token)
 */
router.post('/create-company-document', requireOneDriveAuth, async (req, res) => {
    try {
        const { companyName, docType, createdBy } = req.body;
        if (!companyName || !docType) {
            return res.status(400).json({ error: 'Company Name and Document Type are required' });
        }

        console.log(`Request to create document for ${companyName} (${docType}) by ${createdBy}`);

        // 1. Create in OneDrive
        const result = await oneDriveService.createCompanyDocument(req.accessToken, companyName, docType);

        // 2. Save to DB
        const db = readDb();
        const company = (db.companies || []).find(c => c.name === companyName);

        if (company) {
            if (!company.documents) company.documents = [];
            // Remove existing doc of same type/name if any to avoid duplicates
            // Or just append. Since we overwrite in OneDrive (rename behavior?), let's append/update.
            // Check if file with same ID exists? No ID is new.
            // Check if file with same 'type' exists? 
            // The frontend maps by Title.
            // Let's store a custom object.
            const docData = {
                id: result.id,
                name: result.name,
                webUrl: result.webUrl,
                type: docType,
                createdBy: createdBy || 'System', // Add createdBy
                createdDateTime: result.createdDateTime
            };

            // Remove old entry for this ID if exists (unlikely)
            company.documents = company.documents.filter(d => d.id !== result.id);
            company.documents.push(docData);

            writeDb(db);
        } else {
            console.warn(`Company ${companyName} not found in DB, skipping persistence.`);
        }

        res.json({
            success: true,
            message: 'Document created successfully',
            file: result
        });
    } catch (error) {
        console.error('Error creating company document:', error);
        res.status(500).json({ error: error.message || 'Failed to create document' });
    }
});

/**
 * @route POST /api/onedrive/copy-document
 * @desc Copy a document to the structured folder (PRO/FY/Month/AppNo)
 * @access Private
 */
router.post('/copy-document', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId, applicationFileNo, companyName, applicationDate } = req.body;

        if (!fileId || !applicationFileNo || !applicationDate) {
            return res.status(400).json({ error: 'File ID, Application File Number, and Application Date are required' });
        }

        console.log(`Request to copy file ${fileId} for application ${applicationFileNo} (Date: ${applicationDate})`);

        const result = await oneDriveService.copyDocumentToStructuredFolder(
            req.accessToken,
            fileId,
            applicationFileNo,
            companyName,
            applicationDate
        );

        // Store in Application DB if copy was successful (and we have ID)
        if (result.success && result.id) {
            const appDb = readAppDb();
            // Find application by fileNumber. 
            // Note: applications.json structure is { applications: [...] }
            // Applications have "fileNumber" property.
            const application = (appDb.applications || []).find(app => app.fileNumber === applicationFileNo);

            if (application) {
                if (!application.documents) application.documents = [];

                // Add new document metadata
                const newDoc = {
                    id: result.id,
                    name: result.name,
                    webUrl: result.webUrl,
                    createdDateTime: result.createdDateTime || new Date().toISOString(),
                    type: 'Generated', // or "Detailed Verification" etc.
                    sourceFileId: fileId
                };

                // Check for duplicates? Maybe by ID.
                const existingIndex = application.documents.findIndex(d => d.id === result.id);
                if (existingIndex >= 0) {
                    application.documents[existingIndex] = newDoc;
                } else {
                    application.documents.push(newDoc);
                }

                writeAppDb(appDb);
                console.log(`Saved document ${result.name} to application ${applicationFileNo}`);
            } else {
                console.warn(`Application ${applicationFileNo} not found in DB. Document created but not linked.`);
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Error copying document:', error);
        res.status(500).json({ error: error.message || 'Failed to copy document' });
    }
});


/**
 * @route GET /api/onedrive/company-documents/:companyName
 * @desc Get list of documents for a company from DB
 * @access Private
 */
router.get('/company-documents/:companyName', requireOneDriveAuth, async (req, res) => {
    try {
        const { companyName } = req.params;

        // Read from DB instead of OneDrive
        const db = readDb();
        const company = (db.companies || []).find(c => c.name === companyName);

        if (!company) {
            return res.json([]);
        }

        // Return the documents array. 
        // Frontend expects: { name, webUrl, id ... }
        // Our DB stores exactly that.
        res.json(company.documents || []);

    } catch (error) {
        console.error('Error fetching company files:', error);
        res.status(500).json({ error: error.message });
    }
});

// --- Generic File Management Endpoints ---

// List files
router.get('/files', requireOneDriveAuth, async (req, res) => {
    try {
        const { folderId } = req.query;
        const files = await oneDriveService.listFiles(req.accessToken, folderId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload file
router.post('/files/upload', requireOneDriveAuth, upload.single('file'), async (req, res) => {
    try {
        const { folderId } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'No file provided' });
        }

        // Pass user access token
        const result = await oneDriveService.uploadFile(
            req.accessToken,
            file.originalname,
            file.buffer,
            folderId
        );

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Download file
router.get('/files/:fileId/download', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const fileContent = await oneDriveService.downloadFile(req.accessToken, fileId);

        // Pipe the stream or send buffer?
        // oneDriveService.downloadFile returns result from graph client .get()
        // If we use .get(), it returns JSON/Stream depending on responseType.
        // In service we used .get(). Default is JSON metadata usually unless /content used.
        // The service method calls /content.
        // We should probably handle stream piping.
        // But for now let's assume it returns a response object we can pipe.

        res.send(fileContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete file
router.delete('/files/:fileId', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId } = req.params;

        // 1. Delete from OneDrive
        // (Removed as per user request to only delete from DB)


        // 2. Delete from DB
        // Search all companies for this document ID
        const db = readDb();
        let updated = false;

        if (db.companies) {
            db.companies.forEach(company => {
                if (company.documents) {
                    const initialLen = company.documents.length;
                    company.documents = company.documents.filter(d => d.id !== fileId);
                    if (company.documents.length !== initialLen) updated = true;
                }
            });
        }

        if (updated) {
            writeDb(db);
        }

        res.json({ success: true, message: 'Deleted from DB only' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create folder
router.post('/folders', requireOneDriveAuth, async (req, res) => {
    try {
        const { folderName, parentFolderId } = req.body;
        const result = await oneDriveService.createFolder(
            req.accessToken,
            folderName,
            parentFolderId
        );
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Search files
router.get('/search', requireOneDriveAuth, async (req, res) => {
    try {
        const { query } = req.query;
        const results = await oneDriveService.searchFiles(req.accessToken, query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Upload PDF document
router.post('/upload-pdf', requireOneDriveAuth, upload.single('file'), async (req, res) => {
    try {
        const { applicationFileNo, pdfTitle, applicationId, applicationDate } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ success: false, error: 'No file provided' });
        }

        if (file.mimetype !== 'application/pdf') {
            return res.status(400).json({ success: false, error: 'Only PDF files are allowed' });
        }

        // Calculate financial year and month from APPLICATION DATE
        // Expecting applicationDate in format "dd-mm-yyyy" (e.g., "01-12-2026")
        console.log('[PDF Upload] Received applicationDate:', applicationDate);
        const [day, monthNumFromSplit, year] = applicationDate.split('-').map(Number);
        const dateObj = new Date(year, monthNumFromSplit - 1, day); // month is 0-indexed

        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid Application Date format. Expected dd-mm-yyyy' });
        }

        console.log('[PDF Upload] Parsed date:', dateObj.toISOString(), '| Day:', day, 'Month:', monthNumFromSplit, 'Year:', year);

        const monthNum = dateObj.getMonth(); // 0-indexed

        let financialYear;
        // Financial year: April to March
        if (monthNum >= 3) { // April onwards
            financialYear = `${year}-${year + 1}`;
        } else { // Jan-March
            financialYear = `${year - 1}-${year}`;
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[monthNum];

        console.log('[PDF Upload] Financial Year:', financialYear, '| Month:', month);

        // Folder path: UNIQUE LAGEL FIRM/2025-2026/December/ULF-3561/
        const baseFolderPath = process.env.ONEDRIVE_UPLOAD_ROOT || 'FIRM';
        const folderPath = `${baseFolderPath}/${financialYear}/${month}/${applicationFileNo}`;

        // File name: ULF-3561-SRO SEARCH.pdf
        const fileName = `${applicationFileNo}-${pdfTitle}.pdf`;

        console.log('[PDF Upload Backend] Uploading to OneDrive:');
        console.log('  - Folder:', folderPath);
        console.log('  - File name:', fileName);
        console.log('  - File size:', file.size);
        console.log('  - File type:', file.mimetype);

        // Upload to OneDrive
        // OneDrive API expects path in format: root:/path/to/folder
        const onedriveFolder = `root:/${folderPath}`;

        const result = await oneDriveService.uploadFile(
            req.accessToken,
            fileName,
            file.buffer,
            onedriveFolder
        );

        // Save metadata to applications.json
        const appDb = readAppDb();
        const application = appDb.applications.find(app => app.id === parseInt(applicationId));

        if (application) {
            if (!application.pdfUploads) {
                application.pdfUploads = [];
            }

            const pdfUploadData = {
                id: `pdf-upload-${Date.now()}`,
                pdfDocId: req.body.pdfDocId || null,
                title: pdfTitle,
                fileName: fileName,
                uploadedAt: new Date().toISOString(),
                uploadedBy: req.body.uploadedBy || 'System',
                fileId: result.id,
                fileUrl: result.webUrl,
                path: folderPath
            };

            // Check if already uploaded (same title)
            const existingIndex = application.pdfUploads.findIndex(p => p.title === pdfTitle);
            if (existingIndex !== -1) {
                application.pdfUploads[existingIndex] = pdfUploadData;
            } else {
                application.pdfUploads.push(pdfUploadData);
            }

            writeAppDb(appDb);
        }

        res.json({
            success: true,
            fileUrl: result.webUrl,
            filePath: folderPath,
            fileName: fileName,
            fileId: result.id
        });

    } catch (error) {
        console.error('PDF upload error:', error);
        console.error('PDF upload error message:', error.message);
        console.error('PDF upload error stack:', error.stack);
        res.status(500).json({ success: false, error: `Error uploading PDF: ${error.message}` });
    }
});


// Lock PDF
router.patch('/lock-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId } = req.body;

        const appDb = readAppDb();
        const application = appDb.applications.find(a => a.id === parseInt(applicationId));

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        const pdfIndex = application.pdfUploads.findIndex(p => p.id === pdfId);
        if (pdfIndex === -1) {
            return res.status(404).json({ success: false, error: 'PDF not found' });
        }

        application.pdfUploads[pdfIndex].isLocked = true;
        writeAppDb(appDb);

        res.json({ success: true, message: 'PDF locked successfully' });
    } catch (error) {
        console.error('Lock PDF error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Unlock PDF
router.patch('/unlock-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId } = req.body;

        const appDb = readAppDb();
        const application = appDb.applications.find(a => a.id === parseInt(applicationId));

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        const pdfIndex = application.pdfUploads.findIndex(p => p.id === pdfId);
        if (pdfIndex === -1) {
            return res.status(404).json({ success: false, error: 'PDF not found' });
        }

        application.pdfUploads[pdfIndex].isLocked = false;
        writeAppDb(appDb);

        res.json({ success: true, message: 'PDF unlocked successfully' });
    } catch (error) {
        console.error('Unlock PDF error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete PDF
router.delete('/delete-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId, fileId } = req.body;

        const appDb = readAppDb();
        const application = appDb.applications.find(a => a.id === parseInt(applicationId));

        if (!application) {
            return res.status(404).json({ success: false, error: 'Application not found' });
        }

        // Remove from database
        application.pdfUploads = application.pdfUploads.filter(p => p.id !== pdfId);
        writeAppDb(appDb);

        // Delete from OneDrive
        // (Removed as per user request to only delete from DB)


        res.json({ success: true, message: 'PDF deleted successfully' });
    } catch (error) {
        console.error('Delete PDF error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;


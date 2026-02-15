const express = require('express');
const router = express.Router();
const oneDriveService = require('../services/onedriveService');
const multer = require('multer');
const pool = require('../config/database');
const CompanyModel = require('../models/companyModel');

// Configure multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
});

// Middleware to extract Graph Token from Authorization header
const requireOneDriveAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No access token provided' });
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Invalid token format' });
    }
    req.accessToken = token;
    next();
};

router.post('/create-company-document', requireOneDriveAuth, async (req, res) => {
    try {
        const { companyName, docType, createdBy } = req.body;
        if (!companyName || !docType) {
            return res.status(400).json({ error: 'Company Name and Document Type are required' });
        }

        // 1. Create in OneDrive
        const result = await oneDriveService.createCompanyDocument(req.accessToken, companyName, docType);

        // 2. Save to DB (PostgreSQL)
        const company = await CompanyModel.getByName(companyName);

        if (company) {
            const docData = {
                id: result.id,
                name: result.name,
                webUrl: result.webUrl,
                type: docType,
                createdBy: createdBy || 'System',
                createdDateTime: result.createdDateTime
            };
            await CompanyModel.addDocument(company.id, docData);
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

router.post('/copy-document', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId, applicationFileNo, companyName, applicationDate } = req.body;

        if (!fileId || !applicationFileNo || !applicationDate) {
            return res.status(400).json({ error: 'File ID, Application File Number, and Application Date are required' });
        }

        const result = await oneDriveService.copyDocumentToStructuredFolder(
            req.accessToken,
            fileId,
            applicationFileNo,
            companyName,
            applicationDate
        );

        if (result.success && result.id) {
            // Find application by fileNumber
            const appResult = await pool.query('SELECT id FROM applications WHERE "fileNumber" = $1', [applicationFileNo]);

            if (appResult.rows.length > 0) {
                const appId = appResult.rows[0].id;

                await pool.query(`
                    INSERT INTO application_documents (
                        id, "applicationId", name, "webUrl", type, "sourceFileId", "createdDateTime"
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7)
                `, [
                    result.id,
                    appId,
                    result.name,
                    result.webUrl,
                    'Generated',
                    fileId,
                    result.createdDateTime || new Date()
                ]);
            }
        }

        res.json(result);

    } catch (error) {
        console.error('Error copying document:', error);
        res.status(500).json({ error: error.message || 'Failed to copy document' });
    }
});

router.get('/company-documents/:companyName', requireOneDriveAuth, async (req, res) => {
    try {
        const { companyName } = req.params;
        const company = await CompanyModel.getByName(companyName);
        if (!company) {
            return res.json([]);
        }
        res.json(company.documents || []);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/files', requireOneDriveAuth, async (req, res) => {
    try {
        const { folderId } = req.query;
        const files = await oneDriveService.listFiles(req.accessToken, folderId);
        res.json(files);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/files/upload', requireOneDriveAuth, upload.single('file'), async (req, res) => {
    try {
        const { folderId } = req.body;
        const file = req.file;
        if (!file) return res.status(400).json({ error: 'No file provided' });

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

router.get('/files/:fileId/download', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId } = req.params;
        const fileContent = await oneDriveService.downloadFile(req.accessToken, fileId);
        res.send(fileContent);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/files/:fileId', requireOneDriveAuth, async (req, res) => {
    try {
        const { fileId } = req.params;
        await CompanyModel.removeDocument(fileId);
        res.json({ success: true, message: 'Deleted from DB only' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/folders', requireOneDriveAuth, async (req, res) => {
    try {
        const { folderName, parentFolderId } = req.body;
        const result = await oneDriveService.createFolder(req.accessToken, folderName, parentFolderId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/search', requireOneDriveAuth, async (req, res) => {
    try {
        const { query } = req.query;
        const results = await oneDriveService.searchFiles(req.accessToken, query);
        res.json(results);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/upload-pdf', requireOneDriveAuth, upload.single('file'), async (req, res) => {
    try {
        const { applicationFileNo, pdfTitle, applicationId, applicationDate } = req.body;
        const file = req.file;

        if (!file) return res.status(400).json({ success: false, error: 'No file provided' });
        if (file.mimetype !== 'application/pdf') return res.status(400).json({ success: false, error: 'Only PDF files are allowed' });

        // Calculate folder path logic (Keeping same as before)
        const [day, monthNumFromSplit, year] = applicationDate.split('-').map(Number);
        const dateObj = new Date(year, monthNumFromSplit - 1, day);

        if (isNaN(dateObj.getTime())) {
            return res.status(400).json({ success: false, error: 'Invalid Application Date format. Expected dd-mm-yyyy' });
        }

        const monthNum = dateObj.getMonth();
        let financialYear;
        if (monthNum >= 3) {
            financialYear = `${year}-${year + 1}`;
        } else {
            financialYear = `${year - 1}-${year}`;
        }

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        const month = monthNames[monthNum];

        const baseFolderPath = process.env.ONEDRIVE_UPLOAD_ROOT || 'FIRM';
        const folderPath = `${baseFolderPath}/${financialYear}/${month}/${applicationFileNo}`;
        const fileName = `${applicationFileNo}-${pdfTitle}.pdf`;
        const onedriveFolder = `root:/${folderPath}`;

        const result = await oneDriveService.uploadFile(
            req.accessToken,
            fileName,
            file.buffer,
            onedriveFolder
        );

        // Save metadata to DB
        const pdfUploadData = {
            id: `pdf-upload-${Date.now()}`,
            applicationId: parseInt(applicationId),
            pdfDocId: req.body.pdfDocId || null,
            title: pdfTitle,
            fileName: fileName,
            uploadedAt: new Date().toISOString(),
            uploadedBy: req.body.uploadedBy || 'System',
            fileId: result.id,
            fileUrl: result.webUrl,
            path: folderPath,
            isLocked: false
        };

        await pool.query(`
            INSERT INTO application_pdf_uploads (
                id, "applicationId", "pdfDocId", title, "fileName",
                "uploadedAt", "uploadedBy", "fileId", "fileUrl", path, "isLocked"
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [
            pdfUploadData.id, pdfUploadData.applicationId, pdfUploadData.pdfDocId,
            pdfUploadData.title, pdfUploadData.fileName, pdfUploadData.uploadedAt,
            pdfUploadData.uploadedBy, pdfUploadData.fileId, pdfUploadData.fileUrl,
            pdfUploadData.path, pdfUploadData.isLocked
        ]);

        res.json({
            success: true,
            fileUrl: result.webUrl,
            filePath: folderPath,
            fileName: fileName,
            fileId: result.id
        });

    } catch (error) {
        console.error('PDF upload error:', error);
        res.status(500).json({ success: false, error: `Error uploading PDF: ${error.message}` });
    }
});

router.patch('/lock-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId } = req.body;
        await pool.query('UPDATE application_pdf_uploads SET "isLocked" = TRUE WHERE id = $1 AND "applicationId" = $2', [pdfId, applicationId]);
        res.json({ success: true, message: 'PDF locked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.patch('/unlock-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId } = req.body;
        await pool.query('UPDATE application_pdf_uploads SET "isLocked" = FALSE WHERE id = $1 AND "applicationId" = $2', [pdfId, applicationId]);
        res.json({ success: true, message: 'PDF unlocked successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.delete('/delete-pdf', requireOneDriveAuth, async (req, res) => {
    try {
        const { applicationId, pdfId } = req.body;
        await pool.query('DELETE FROM application_pdf_uploads WHERE id = $1 AND "applicationId" = $2', [pdfId, applicationId]);
        res.json({ success: true, message: 'PDF deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

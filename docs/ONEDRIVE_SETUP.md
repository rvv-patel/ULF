# OneDrive Integration Setup Guide

## Overview
This guide will help you set up OneDrive integration for automatic document folder creation when new applications are created.

## Prerequisites
- Microsoft 365 account or personal Microsoft account with OneDrive
- Access to Azure Portal (for setting up App Registration)
- Administrator access to the backend server

## Step 1: Create Azure App Registration

### 1.1 Access Azure Portal
1. Go to [Azure Portal](https://portal.azure.com)
2. Sign in with your Microsoft account
3. Navigate to **Azure Active Directory** > **App registrations**

### 1.2 Register New Application
1. Click **"New registration"**
2. Fill in the details:
   - **Name**: `Legal Firm Application Manager` (or your preferred name)
   - **Supported account types**: Choose one of:
     - **Single tenant** - Only users in your organization
     - **Multitenant** - Users in any organization
     - **Personal Microsoft accounts** - For personal OneDrive
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:3001/api/onedrive/callback`
3. Click **Register**

### 1.3 Get Application Credentials
1. After registration, you'll see the **Overview** page
2. **Copy and save** these values:
   - **Application (client) ID** → This is your `ONEDRIVE_CLIENT_ID`
   - **Directory (tenant) ID** → This is your `ONEDRIVE_TENANT_ID`

### 1.4 Create Client Secret
1. In the left menu, click **Certificates & secrets**
2. Click **"New client secret"**
3. Add a description: `Backend API Secret`
4. Choose expiration period (recommended: 24 months)
5. Click **Add**
6. **IMPORTANT**: Copy the **Value** immediately (it won't be shown again)
   - This is your `ONEDRIVE_CLIENT_SECRET`

### 1.5 Configure API Permissions
1. In the left menu, click **API permissions**
2. Click **"Add a permission"**
3. Select **Microsoft Graph**
4. Select **Delegated permissions**
5. Add these permissions:
   - `Files.ReadWrite.All` - Read and write files in all site collections
   - `offline_access` - Maintain access to data you have given it access to
6. Click **Add permissions**
7. Click **"Grant admin consent for [Your Organization]"** (if available)

### 1.6 Update Redirect URIs for Production
When deploying to production:
1. Go to **Authentication** in the left menu
2. Add production redirect URI:
   - `https://yourdomain.com/api/onedrive/callback`
3. Save changes

## Step 2: Configure Backend Environment Variables

### 2.1 Update .env File
Open `backendService/.env` and update the OneDrive settings:

```env
# OneDrive Integration Settings
ONEDRIVE_CLIENT_ID=your_actual_client_id_from_step_1.3
ONEDRIVE_CLIENT_SECRET=your_actual_client_secret_from_step_1.4
ONEDRIVE_TENANT_ID=your_actual_tenant_id_from_step_1.3
ONEDRIVE_REDIRECT_URI=http://localhost:3001/api/onedrive/callback
ONEDRIVE_BASE_FOLDER=Applications
FRONTEND_URL=http://localhost:5173
```

### 2.2 Verify Configuration
- `ONEDRIVE_CLIENT_ID`: 36-character GUID
- `ONEDRIVE_CLIENT_SECRET`: Random string (keep it secret!)
- `ONEDRIVE_TENANT_ID`: 36-character GUID or "common" for personal accounts
- `ONEDRIVE_REDIRECT_URI`: Must match Azure App Registration
- `ONEDRIVE_BASE_FOLDER`: Root folder name in OneDrive (all application folders will be created here)
- `FRONTEND_URL`: Your React app URL

## Step 3: Install Dependencies

### 3.1 Backend Dependencies
```bash
cd backendService
npm install axios
```

### 3.2 Restart Backend Server
```bash
npm run dev
```

## Step 4: Connect OneDrive Account

### 4.1 Access Settings Page
1. Open your application frontend
2. Navigate to **Settings** or **OneDrive Settings** page
3. You should see the OneDrive integration status

### 4.2 Authenticate
1. Click **"Connect OneDrive"** button
2. You'll be redirected to Microsoft login page
3. Sign in with your Microsoft account
4. Grant the requested permissions:
   - Read and write files
   - Offline access
5. After successful authentication, you'll be redirected back to your application

### 4.3 Verify Connection
- The status should show **"Connected to OneDrive"**
- A green checkmark icon should appear

## Step 5: Test Integration

### 5.1 Create Test Application
1. Go to **Applications** > **Add New**
2. Fill in the required details:
   - Applicant Name
   - Company
   - Other fields
3. Click **Create**

### 5.2 Verify Folder Creation
1. Open OneDrive in your browser: [OneDrive.com](https://onedrive.live.com)
2. Navigate to the **Applications** folder
3. You should see a new folder named: `[FILE-NUMBER] - [APPLICANT-NAME]`
4. Inside, there should be an initial template document

### 5.3 Check Application Details
- The created application should have OneDrive folder URL stored
- You can add a button to open the OneDrive folder directly from the application view

## Folder Structure

When a new application is created, the following structure is automatically created in OneDrive:

```
OneDrive/
└── Applications/                    (Base folder)
    ├── [Company Name]/              (Optional - if company is specified)
    │   └── ULF-12345 - John Doe/   (Application folder)
    │       └── ULF-12345_Application.txt
    └── ULF-67890 - Jane Smith/      (Application folder without company)
        └── ULF-67890_Application.txt
```

## Troubleshooting

### Issue: "OneDrive not authenticated" error
**Solution**: 
1. Check if credentials in `.env` are correct
2. Verify redirect URI matches exactly in Azure and `.env`
3. Try reconnecting from Settings page

### Issue: "Failed to create folder" error
**Solution**:
1. Verify API permissions are granted in Azure
2. Check if token has expired (reconnect)
3. Ensure network connectivity to Microsoft Graph API

### Issue: Folders not creating automatically
**Solution**:
1. Check backend console logs for OneDrive errors
2. Verify authentication status in Settings page
3. Ensure OneDrive service is properly initialized
4. Check application creation logs

### Issue: Token expired
**Solution**:
- The system uses refresh tokens for automatic renewal
- If expired, simply reconnect from Settings page

## Security Best Practices

1. **Keep client secret secure**: Never commit `.env` file to version control
2. **Use environment-specific credentials**: Different credentials for dev/staging/production
3. **Regular token rotation**: Periodically regenerate client secrets in Azure
4. **Minimum permissions**: Only grant necessary Graph API permissions
5. **Audit access**: Regularly review who has access to the Azure App Registration

## Production Deployment

### Update Configuration
1. Create new App Registration (or update existing)
2. Add production redirect URI
3. Update production `.env` file with credentials
4. Test authentication flow in production environment

### SSL/HTTPS Required
- Microsoft OAuth requires HTTPS in production
- Ensure your production server has valid SSL certificate

## API Endpoints

The following endpoints are available:

- `GET /api/onedrive/auth-url` - Get OAuth authentication URL
- `GET /api/onedrive/callback` - OAuth callback handler
- `GET /api/onedrive/status` - Check authentication status
- `POST /api/onedrive/create-folder` - Manually create folder
- `POST /api/onedrive/upload-file` - Upload file to OneDrive

## Additional Features

### Manual Folder Creation
You can manually create folders for existing applications:

```javascript
POST /api/onedrive/create-folder
{
  "fileNumber": "ULF-12345",
  "applicantName": "John Doe",
  "companyName": "ABC Corp"
}
```

### File Upload
Upload documents to application folder:

```javascript
POST /api/onedrive/upload-file
{
  "fileName": "document.pdf",
  "fileContent": "base64_encoded_content",
  "folderPath": "Applications/ULF-12345 - John Doe"
}
```

## Support

For issues or questions:
1. Check backend console logs
2. Review Azure App Registration configuration
3. Verify network connectivity to `graph.microsoft.com`
4. Ensure all permissions are granted in Azure Portal

## References

- [Microsoft Graph API Documentation](https://learn.microsoft.com/en-us/graph/overview)
- [OneDrive API](https://learn.microsoft.com/en-us/graph/api/resources/onedrive)
- [Azure App Registration](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app)

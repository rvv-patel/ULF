const msal = require('@azure/msal-node');

const msalConfig = {
    auth: {
        clientId: process.env.ONEDRIVE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.ONEDRIVE_TENANT_ID}`,
        clientSecret: process.env.ONEDRIVE_CLIENT_SECRET,
    },
    system: {
        loggerOptions: {
            loggerCallback(loglevel, message, containsPii) {
                console.log(message);
            },
            piiLoggingEnabled: false,
            logLevel: msal.LogLevel.Verbose,
        }
    }
};

const SCOPES = [
    'User.Read',
    'Files.Read',
    'Files.ReadWrite.All',
    'offline_access'
];

module.exports = { msalConfig, SCOPES };

import type { Configuration, PopupRequest } from "@azure/msal-browser";

export const msalConfig: Configuration = {
    auth: {
        clientId: "31f5b1d3-990d-46cb-b631-5b52d36149cb",
        authority: "https://login.microsoftonline.com/common",
        redirectUri: "http://localhost:5173",
    },
    cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
    },
};

export const loginRequest: PopupRequest = {
    scopes: ["User.Read", "Files.Read", "Files.ReadWrite.All", "offline_access"]
};

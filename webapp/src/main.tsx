import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store/store'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App.tsx'

import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./config/authConfig";

const msalInstance = new PublicClientApplication(msalConfig);

// Capture initial hash before MSAL consumes it!
const initialHash = window.location.hash;
const initialSearch = window.location.search;

msalInstance.initialize().then(async () => {
  // Check if this appears to be an auth callback (has code= in URL)
  // We ONLY want to treat this as a popup callback if window.opener is present
  const isAuthCallback = window.opener && (initialHash.includes('code=') || initialSearch.includes('code='));

  if (isAuthCallback) {
    console.log("Running in auth popup - skipping app render");
    setTimeout(() => {
      window.close();
    }, 100);
    return;
  }

  // Handle redirect callback for the main window (Redirect flow)
  // This processes the hash and sets the active account
  try {
    const result = await msalInstance.handleRedirectPromise();
    if (result && result.account) {
      msalInstance.setActiveAccount(result.account);
    }
  } catch (error) {
    console.error("Redirect handling failed", error);
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MsalProvider instance={msalInstance}>
        <Provider store={store}>
          <BrowserRouter>
            <AuthProvider>
              <App />
            </AuthProvider>
          </BrowserRouter>
        </Provider>
      </MsalProvider>
    </StrictMode>,
  )
});

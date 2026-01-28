import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '../App';
import { LanguageProvider } from '../context/LanguageContext';
import { NotificationProvider } from '../context/NotificationContext';
import { MedicationProvider } from '../context/MedicationContext';
import ErrorBoundary from '../components/ErrorBoundary';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';
import './index.css';

// Mount React immediately - Vite modules are deferred and run after DOM is ready
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('FATAL: No #root element found');
  document.body.innerHTML = '<h1>App Error: Root element missing</h1>';
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <ErrorBoundary componentName="Root">
          <AuthProvider>
            <LanguageProvider>
              <NotificationProvider>
                <MedicationProvider>
                  <App />
                  <Toaster position="top-center" />
                </MedicationProvider>
              </NotificationProvider>
            </LanguageProvider>
          </AuthProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('✅ React mounted successfully at', new Date().toLocaleTimeString());
  } catch (error) {
    console.error('FATAL: React failed to mount:', error);
    rootElement.innerHTML = '<h1>App Failed to Load</h1>';
  }
}
import React from 'react';
import { LegalVerification } from './LegalVerification';
import { EmailVerification } from './EmailVerification';

interface VerificationSectionProps {
    propertyAddress: string;
    initialTab?: 'Legal' | 'Email';
    companyName: string;
    applicationFileNo: string;
    generatedDocuments?: any[];
    applicationId: number;
    applicationDate?: string;
    pdfUploads?: any[];
}

export const VerificationSection: React.FC<VerificationSectionProps> = ({ propertyAddress, initialTab = 'Legal', companyName, applicationFileNo, generatedDocuments = [], applicationId, applicationDate, pdfUploads = [] }) => {
    // If we want to hide the internal tabs when a specific one is forced, we can.
    // However, the parent page now has tabs "Legal" and "Email". 
    // So this component might just be a wrapper. 
    // Let's just render the specific content based on initialTab and hide the sidebar if intended to be "single mode".

    // Actually, simpler approach: The parent is treating "Legal" and "Email" as separate full tabs. 
    // So if initialTab is "Legal", we show Legal. If "Email", we show Email. 
    // We can remove the internal sidebar navigation effectively if we are in this "directed" mode.

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
            {initialTab === 'Legal' ? (
                <div className="p-8">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Legal Verification</h2>
                        <p className="text-sm text-gray-500">Review property documents and legal status.</p>
                    </div>
                    <LegalVerification
                        propertyAddress={propertyAddress}
                        companyName={companyName}
                        applicationFileNo={applicationFileNo}
                        generatedDocuments={generatedDocuments}
                        applicationId={applicationId}
                        applicationDate={applicationDate}
                        pdfUploads={pdfUploads}
                    />
                </div>
            ) : (
                <div className="p-8">
                    <div className="mb-6 pb-6 border-b border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900">Email Triggers</h2>
                        <p className="text-sm text-gray-500">Manage automated communications and recipients.</p>
                    </div>
                    <EmailVerification companyName={companyName} />
                </div>
            )}
        </div>
    );
};

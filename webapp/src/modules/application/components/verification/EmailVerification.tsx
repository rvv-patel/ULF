import React, { useState, useEffect } from 'react';
import { Mail, Plus, Send, User, Check, AtSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../../../store/store';
import { fetchCompanies } from '../../../../store/slices/companySlice';

interface EmailVerificationProps {
    companyName?: string;
}

export const EmailVerification: React.FC<EmailVerificationProps> = ({ companyName }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { items: companies } = useSelector((state: RootState) => state.company);
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [availableEmails, setAvailableEmails] = useState<string[]>([]);
    const [newEmail, setNewEmail] = useState('');
    const [remark, setRemark] = useState('');

    useEffect(() => {
        dispatch(fetchCompanies());
    }, [dispatch]);

    useEffect(() => {
        if (companyName && companies.length > 0) {
            const company = companies.find(c => c.name === companyName);
            if (company && company.emails) {
                setAvailableEmails(company.emails);
                setSelectedEmails(company.emails); // Select all by default
            } else {
                setAvailableEmails([]);
                setSelectedEmails([]);
            }
        }
    }, [companyName, companies]);

    const toggleEmail = (email: string) => {
        if (selectedEmails.includes(email)) {
            setSelectedEmails(selectedEmails.filter(e => e !== email));
        } else {
            setSelectedEmails([...selectedEmails, email]);
        }
    };

    const handleSaveEmail = () => {
        if (newEmail && !availableEmails.includes(newEmail)) {
            setAvailableEmails([...availableEmails, newEmail]);
            setSelectedEmails([...selectedEmails, newEmail]);
            setNewEmail('');
        }
    };

    const handleSelectAll = () => {
        if (selectedEmails.length === availableEmails.length) {
            setSelectedEmails([]);
        } else {
            setSelectedEmails([...availableEmails]);
        }
    };

    const handleSend = () => {
        console.log('Sending...', { selectedEmails, remark });
        // Implement send logic here
        alert(`Email sent to ${selectedEmails.length} recipients.`);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recipients List Column */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <User size={20} className="text-gray-400" />
                        Recipients <span className="text-sm font-normal text-gray-500">({selectedEmails.length} selected)</span>
                    </h3>
                    <div
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                        onClick={handleSelectAll}
                    >
                        {selectedEmails.length === availableEmails.length ? 'Deselect All' : 'Select All'}
                    </div>
                </div>

                <div className="bg-white border boundary-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="max-h-[500px] overflow-y-auto divide-y divide-gray-100">
                        {availableEmails.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">
                                No email recipients found for {companyName || 'this company'}.
                                <br />Add a new recipient below.
                            </div>
                        ) : (
                            availableEmails.map((email, idx) => {
                                const isSelected = selectedEmails.includes(email);
                                return (
                                    <div
                                        key={idx}
                                        className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => toggleEmail(email)}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                                }`}>
                                                {email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className={`text-sm font-medium ${isSelected ? 'text-gray-900' : 'text-gray-500'}`}>{email}</div>
                                                <div className="text-xs text-gray-400">Company Email</div>
                                            </div>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300 bg-white'
                                            }`}>
                                            {isSelected && <Check size={14} className="text-white" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <AtSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="Add external recipient..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <button
                                onClick={handleSaveEmail}
                                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                                <Plus size={16} />
                                Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Compose / Action Column */}
            <div className="lg:col-span-1">
                <div className="sticky top-8 space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <Mail size={20} className="text-gray-400" />
                        Trigger Email
                    </h3>

                    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subject</label>
                                <div className="text-sm font-medium text-gray-900 border-b border-gray-100 pb-2">
                                    Action Required: Legal Verification Documents
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Message</label>
                                <textarea
                                    value={remark}
                                    onChange={(e) => setRemark(e.target.value)}
                                    rows={8}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder="Type your message to the selected recipients..."
                                />
                            </div>

                            <button
                                onClick={handleSend}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Send size={18} />
                                Send Email
                            </button>

                            <p className="text-xs text-center text-gray-400">
                                This will send an automated email to all {selectedEmails.length} selected recipients.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

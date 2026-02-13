import { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search } from 'lucide-react';

interface Option<T extends string | number> {
    label: string;
    value: T;
}

interface SearchableSelectProps<T extends string | number> {
    options: Option<T>[];
    value: T;
    onChange: (value: T) => void;
    placeholder?: string;
    className?: string;
}

export const SearchableSelect = <T extends string | number>({
    options,
    value,
    onChange,
    placeholder = 'Select option',
    className = ''
}: SearchableSelectProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const dropdownRef = useRef<HTMLDivElement>(null);

    const filteredOptions = options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(option => option.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleSelect = (optionValue: T) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm('');
    };

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={`block truncate ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                    <div className="sticky top-0 bg-white px-2 py-2 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                className="w-full border border-gray-200 rounded-md pl-8 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    {filteredOptions.length === 0 ? (
                        <div className="cursor-default select-none relative py-2 px-4 text-gray-700 text-center italic">
                            No results found.
                        </div>
                    ) : (
                        filteredOptions.map((option) => (
                            <div
                                key={option.value}
                                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 transition ${value === option.value ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
                                    }`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className={`block truncate ${value === option.value ? 'font-medium' : 'font-normal'}`}>
                                    {option.label}
                                </span>
                                {value === option.value && (
                                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                                        <Check className="h-5 w-5" />
                                    </span>
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

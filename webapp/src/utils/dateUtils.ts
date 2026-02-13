/**
 * Converts YYYY-MM-DD string to DD-MM-YYYY string.
 * Used when sending data to API.
 */
export const toApiDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}-${month}-${year}`;
};

/**
 * Converts DD-MM-YYYY string to YYYY-MM-DD string.
 * Used when displaying data in date inputs.
 */
export const fromApiDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
};

/**
 * Returns current date in DD-MM-YYYY format.
 */
export const getCurrentApiDate = (): string => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
};

import * as XLSX from 'xlsx';

export const exportToExcel = (data: any[], filename: string) => {
    // 1. Create a worksheet from the data
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 2. Create a new workbook and append the worksheet
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // 3. Generate the Excel file and trigger download
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};

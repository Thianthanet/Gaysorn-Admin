import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName, columnWidths) => {
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = columnWidths;
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};

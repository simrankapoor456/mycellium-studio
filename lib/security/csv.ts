const SPREADSHEET_FORMULA_PREFIX = /^[\t\r\n ]*[=+\-@]/;

export function neutralizeSpreadsheetFormula(value: string | number): string {
  const text = String(value);
  return SPREADSHEET_FORMULA_PREFIX.test(text) ? `'${text}` : text;
}

export function toCsvCell(value: string | number): string {
  return `"${neutralizeSpreadsheetFormula(value).replaceAll('"', '""')}"`;
}

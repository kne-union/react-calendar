export const YEAR_PAGE_SIZE = 12;

export const getYearPageStart = year => Math.floor(year / YEAR_PAGE_SIZE) * YEAR_PAGE_SIZE;

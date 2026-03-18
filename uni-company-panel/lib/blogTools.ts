export const normalizeListOptions = (
  rowsPerPage = 10,
  page = 1,
  search = '',
  query = {},
) => {
  // REMOVED: page += 1; (This was forcing page 2)

  // 1. Start with the base params
  const paramsObj: any = {
    page: page.toString(),
    limit: rowsPerPage.toString(),
    search: search || '',
  };

  // 2. Only add query properties if they actually have a value
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      paramsObj[key] = String(value);
    }
  });

  const params = new URLSearchParams(paramsObj);
  return params.toString();
};

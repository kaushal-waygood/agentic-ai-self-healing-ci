export const normalizeListOptions = (
  rowsPerPage = 10,
  page = 1,
  search = '',
  query = {},
) => {
  page += 1;
  const params = new URLSearchParams({
    page: page.toString(),
    limit: rowsPerPage.toString(),
    search: search || '',
    ...query,
  });
  return params.toString();
};

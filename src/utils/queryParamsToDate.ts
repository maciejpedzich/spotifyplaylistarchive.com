export const queryParamsToDate = (queryParams: URLSearchParams) => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const queryYear = queryParams.has('year')
    ? Math.max(
        Math.min(
          // If year param is NaN, use currentYear instead
          Number(queryParams.get('year')) || currentYear,
          currentYear
        ),
        2021
      )
    : currentYear;

  const parsedMonthParam = Math.min(
    Math.max(
      // JS Date months are zero-based, but query params aren't.
      // This is for the end-user's convenience
      (Number(queryParams.get('month')) || 1) - 1,
      0
    ),
    11 // December
  );

  const queryMonth = queryParams.has('month')
    ? queryYear === currentYear
      ? Math.min(parsedMonthParam, currentMonth)
      : parsedMonthParam
    : currentMonth;

  return new Date(queryYear, queryMonth);
};

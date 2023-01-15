export const queryParamsToDate = (queryParams: URLSearchParams) => {
  const today = new Date();

  const year = queryParams.has('year')
    ? Math.max(
        Math.min(
          Number(queryParams.get('year')) || today.getFullYear(),
          today.getFullYear()
        ),
        2021
      )
    : today.getFullYear();

  const normalisedMonthParam = Math.min(
    // Query param months aren't zero-based, but JS Date months are
    Math.max((Number(queryParams.get('month')) || 1) - 1, 0),
    11
  );

  const month = queryParams.has('month')
    ? year === today.getFullYear()
      ? Math.min(normalisedMonthParam, today.getMonth())
      : normalisedMonthParam
    : today.getMonth();

  return new Date(year, month);
};

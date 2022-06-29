export function filterByUniqueKeyValue<T>(items: T[], key: keyof T) {
  return [...new Map(items.map((item) => [item[key], item])).values()];
}

export const mapEntries = (object, mapper) =>
  Object.fromEntries(Object.entries(object).map(mapper));

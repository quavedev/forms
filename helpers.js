export const mapEntries = (object, mapper) =>
  Object.fromEntries(Object.entries(object).map(mapper));

export const mergeClassNames = (...args) => args.filter(Boolean).join(' ');

export const pickOrOmit = (rawFields, pickFields, omitFields) => {
  if (pickFields?.length) {
    const picked = pickFields.reduce(
      (acc, fieldName) => ({
        ...acc,
        [fieldName]: rawFields[fieldName] || null,
      }),
      {}
    );
    if (Object.values(picked).includes(null)) {
      throw Error(`Unable to pick value from fields: ${pickFields}`);
    }
    return picked;
  }

  if (omitFields?.length) {
    const mutatedFields = { ...rawFields };
    omitFields.forEach(fieldName => {
      delete mutatedFields[fieldName];
    });
    return mutatedFields;
  }

  return rawFields;
};

// Get initial value from defaultValue if it's not present in initialValues
export const getInitialValues = ({
  initialValues,
  fields,
  clipValues,
  stringifyValue,
}) => ({
  ...(clipValues ? {} : initialValues),
  ...Object.fromEntries(
    Object.entries(fields).map(([key, fieldDefinition]) => {
      const value = initialValues[key] ?? fieldDefinition.defaultvalue ?? '';
      return [
        key,
        stringifyValue?.({ value, definition: fields[key], key }) || value,
      ];
    })
  ),
});

export const getOnSubmit = ({
  onSubmit,
  simpleSchema,
  autoClean,
  initialValues,
  fields,
  parseValue,
}) => async (rawValues, actions) => {
  // We want to use clean to do conversions (e.g. date strings to Date), but
  // keep excess values passed
  const values = {
    ...initialValues,
    ...(simpleSchema && autoClean ? simpleSchema.clean(rawValues) : rawValues),
  };
  const parsedValues = mapEntries(values, ([key, value]) => [
    key,
    parseValue?.({ value, definition: fields[key], key }) || value,
  ]);

  return onSubmit
    ? onSubmit(parsedValues, actions)
    : defaultOnSubmit(parsedValues, actions);
};

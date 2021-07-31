export const defaultValidate = (values, { validationContext }) => {
  validationContext.validate(values);

  return Object.fromEntries(
    Object.keys(values)
      .map(key => [key, validationContext.keyErrorMessage(key)])
      .filter(([, message]) => Boolean(message))
  );
};

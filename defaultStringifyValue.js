import { DateTimeType } from 'meteor/quave:custom-type-date-time/DateTimeType';

export const defaultStringifyValue = (value, fieldDefinition) => {
  switch (fieldDefinition.type) {
    case DateTimeType:
      return value ? value.formatDate() : value;

    default:
      return value;
  }
};
